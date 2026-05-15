import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { v2 as webdav } from 'webdav-server';
import { JrefFileSystem } from '../utils/webdav-vfs.js';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

export class MountCommand extends Command {
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 5000;

  readonly definition = {
    name: 'mount',
    description: 'Mount a snapshot as a WebDAV virtual drive',
    usage: 'jref mount <snapshot.json> [options]',
    options: [
      {
        flags: '--port, -p <number>',
        description: 'Port to run the WebDAV server on (default: 8080)',
        defaultValue: 8080
      },
      {
        flags: '--proot',
        description: 'Execute a proot jail binding the mount to /workspace (Linux/ARM only)',
        defaultValue: false
      }
    ],
    examples: [
      'jref mount project.json',
      'jref mount project.json -p 8888',
      'jref mount project.json --proot'
    ],
    workflows: [
      'Exposes the internal files map of a snapshot as a virtual filesystem.',
      'Saves made via WebDAV are committed back to the JSON snapshot in memory.',
      'Changes are debounced and persisted to the original file every 5 seconds.',
      'On exit (Ctrl+C), any pending changes are saved back to the original file.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    const { snapshotPath, port, useProot } = this.parseArgs(args);

    if (!snapshotPath) {
      return this.error('Missing snapshot path', options);
    }

    try {
      const snapshot = await this.getSnapshot(context, options, snapshotPath);
      const server = new webdav.WebDAVServer({
        port,
        hostname: '127.0.0.1'
      });

      const jfs = new JrefFileSystem(snapshot);
      
      // Setup debounced save
      const scheduleSave = () => {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.persist(snapshotPath, snapshot);
        }, this.DEBOUNCE_MS);
      };

      jfs.events.on('change', () => {
        scheduleSave();
      });

      // Mount the filesystem
      await new Promise<void>((resolve, reject) => {
        server.setFileSystem('/', jfs, (success) => {
          if (success) resolve();
          else reject(new Error('Failed to mount filesystem'));
        });
      });

      // Start the server
      await new Promise<void>((resolve, reject) => {
        server.start(() => {
          resolve();
        });

        const nodeServer = (server as any).server;
        if (nodeServer) {
          nodeServer.on('error', (err: any) => {
            console.error(`\nFailed to start WebDAV server on port ${port}. Error: ${err.message}`);
            if (err.code === 'EADDRINUSE') {
               console.error(`Port ${port} is already in use. Try specifying a different port using the -p flag.`);
            }
            reject(err);
          });
        }
      });

      console.error(`WebDAV server running at: http://127.0.0.1:${port}/`);

      if (useProot) {
        return this.handleProot(snapshotPath, snapshot, server);
      }

      return new Promise((resolve) => {
        const shutdown = () => {
          console.error('\nStopping server and saving changes...');
          if (this.saveTimeout) clearTimeout(this.saveTimeout);
          server.stop(() => {
            try {
              this.persist(snapshotPath, snapshot);
              resolve(this.success());
            } catch (err) {
              resolve(this.error(`Failed to save snapshot: ${(err as Error).message}`, options));
            }
          });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
      });
    } catch (err) {
      return this.error(`Mount failed: ${(err as Error).message}`, options);
    }
  }

  private persist(snapshotPath: string, snapshot: ProjectSnapshot) {
    if (snapshotPath !== '-') {
      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
      console.error(`Changes persisted to ${snapshotPath}`);
    }
  }

  private async handleProot(
    snapshotPath: string,
    snapshot: ProjectSnapshot,
    server: webdav.WebDAVServer
  ): Promise<CommandResult> {
    // Proot implementation:
    // 1. We need a physical directory to bind. 
    // Since we want to "bypass network overhead", we'll create a shadow directory
    // and keep it in sync. For simplicity in this implementation, we'll use a 
    // temporary directory and unflatten the snapshot into it.
    
    const mountDir = path.join(os.tmpdir(), `jref-mount-${Date.now()}`);
    fs.mkdirSync(mountDir, { recursive: true });

    console.error(`Preparing virtual workspace in ${mountDir}...`);
    
    // Unflatten files into the mount directory
    for (const [filePath, content] of Object.entries(snapshot.files)) {
      const fullPath = path.join(mountDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }

    console.error(`Starting proot jail...`);
    
    return new Promise((resolve) => {
      const child = spawn('proot', [
        '-b', `${mountDir}:/workspace`,
        '-w', '/workspace',
        '/bin/sh'
      ], {
        stdio: 'inherit',
        env: { ...process.env, JREF_VIRTUAL: 'true' }
      });

      const cleanup = () => {
        console.error('\nCleaning up proot and saving changes...');
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        
        // Sync changes back from mountDir to snapshot before saving
        this.syncBack(mountDir, snapshot);
        
        server.stop(() => {
          this.persist(snapshotPath, snapshot);
          // Recursively delete mountDir
          fs.rmSync(mountDir, { recursive: true, force: true });
          resolve(this.success());
        });
      };

      child.on('exit', () => {
        cleanup();
      });

      process.on('SIGINT', () => {
        child.kill('SIGINT');
      });
    });
  }

  private syncBack(mountDir: string, snapshot: ProjectSnapshot) {
    const walk = (dir: string, base: string = '') => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.join(base, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          snapshot.files[relPath] = fs.readFileSync(fullPath, 'utf8');
        }
      }
    };
    
    // Clear current files and sync from disk
    // Note: This might be dangerous if user deleted files in the snapshot 
    // but they still exist on disk? Actually, we want to reflect the DISK state.
    snapshot.files = {};
    walk(mountDir);
  }

  protected parseArgs(args: string[]): { snapshotPath?: string; port: number; useProot: boolean } {
    const positional: string[] = [];
    let port = 8080;
    let useProot = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--port' || arg === '-p') {
        const val = args[++i];
        if (val) port = parseInt(val, 10);
      } else if (arg === '--proot') {
        useProot = true;
      } else if (!arg.startsWith('-')) {
        positional.push(arg);
      }
    }

    return { 
      snapshotPath: positional[0], 
      port,
      useProot
    };
  }
}
