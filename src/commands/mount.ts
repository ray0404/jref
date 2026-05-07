import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { v2 as webdav } from 'webdav-server';
import { JrefFileSystem } from '../utils/webdav-vfs.js';
import fs from 'fs';

export class MountCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'mount',
    description: 'Mount a snapshot as a WebDAV virtual drive',
    usage: 'jref mount <snapshot.json> [options]',
    options: [
      {
        flags: '--port, -p <number>',
        description: 'Port to run the WebDAV server on (default: 8080)',
        defaultValue: 8080
      }
    ],
    examples: [
      'jref mount project.json',
      'jref mount project.json -p 8888'
    ],
    workflows: [
      'Exposes the internal files map of a snapshot as a virtual filesystem.',
      'Saves made via WebDAV are committed back to the JSON snapshot in memory.',
      'On exit (Ctrl+C), the mutated snapshot is saved back to the original file.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    const { snapshotPath, port } = this.parseArgs(args);

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
      
      // Mount the filesystem
      await new Promise<void>((resolve, reject) => {
        server.setFileSystem('/', jfs, (success) => {
          if (success) resolve();
          else reject(new Error('Failed to mount filesystem'));
        });
      });

      // Start the server
      await new Promise<void>((resolve, reject) => {
        server.start((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Bind to 127.0.0.1 is handled by the server implementation by default if not specified?
      // Actually, we can pass it in start() or via options.
      // The lib documentation says start() takes a callback.

      console.log(`WebDAV server running at: http://127.0.0.1:${port}/`);

      return new Promise((resolve) => {
        const shutdown = () => {
          console.log('\nStopping server and saving changes...');
          server.stop(() => {
            try {
              if (snapshotPath !== '-') {
                fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
                console.log(`Changes saved to ${snapshotPath}`);
              }
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

  protected parseArgs(args: string[]): { snapshotPath?: string; port: number } {
    const positional: string[] = [];
    let port = 8080;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--port' || arg === '-p') {
        const val = args[++i];
        if (val) port = parseInt(val, 10);
      } else if (!arg.startsWith('-')) {
        positional.push(arg);
      }
    }

    return { 
      snapshotPath: positional[0], 
      port 
    };
  }
}
