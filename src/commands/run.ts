/**
 * Run Command
 * Executes a script directly from the JSON snapshot without permanent extraction
 * Supports Node.js scripts and any other executable scripts with shebangs
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { mkdir, writeFile, existsSync, createReadStream, rmSync } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

interface RunFlags {
  path?: string;
  args?: string[];
}

export class RunCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'run',
    description: 'Execute a script directly from the snapshot',
    usage: 'jref run --path <script-path> [file] [script-args...]',
    options: [
      {
        flags: '--path, -p <path>',
        description: 'Path to the script within the snapshot'
      }
    ],
    examples: [
      'jref run --path scripts/setup.ts snapshot.json',
      'jref run --path main.js project.json -- --port 8080',
      'cat snapshot.json | jref run --path index.js'
    ],
    workflows: [
      'Isolated Execution: Files are extracted to a temporary directory and removed after execution.',
      'Auto-Runner Detection: Automatically detects node, python3, or bash based on file extension.',
      'TypeScript Support: Uses node with --experimental-strip-types for .ts files (Node 22+).',
      'Argument Passing: Use -- to separate jref args from script args.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    const tempDir = join(tmpdir(), `jref-run-${randomBytes(4).toString('hex')}`);
    
    try {
      const { flags, filePath, scriptArgs } = this.parseArgs(args);

      if (!flags.path) {
        return this.error('Script path is required (--path <path>)', options);
      }

      // We need to extract the target file AND maybe its dependencies?
      // For now, let's extract ALL files to a temp directory to ensure dependencies work
      // though for 1GB files this is slow. 
      // Ideally we'd only extract what's needed, but that's complex (need to parse imports).
      
      if (!options.silent) {
        console.log(`⏳ Preparing execution environment in ${tempDir}...`);
      }

      await mkdirAsync(tempDir, { recursive: true });

      if (options.jq) {
        // Use full loading when JQ is active
        const snapshot = await this.getSnapshot(context, options, filePath);
        for (const [path, content] of Object.entries(snapshot.files)) {
          const outputPath = join(tempDir, path);
          const parentDir = dirname(outputPath);
          if (!existsSync(parentDir)) {
            await mkdirAsync(parentDir, { recursive: true });
          }
          await writeFileAsync(outputPath, content, 'utf8');
        }
      } else {
        // Use streaming processor to avoid OOM
        await processSnapshot(
          filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
          {
            onFile: async (path, content) => {
              const outputPath = join(tempDir, path);
              const parentDir = dirname(outputPath);
              if (!existsSync(parentDir)) {
                await mkdirAsync(parentDir, { recursive: true });
              }
              await writeFileAsync(outputPath, content, 'utf8');
            }
          }
        );
      }

      const scriptPath = join(tempDir, flags.path);
      if (!existsSync(scriptPath)) {
        return this.error(`Script not found in snapshot: ${flags.path}`, options);
      }

      // Execute the script
      if (!options.silent) {
        console.log(`🚀 Executing ${flags.path}...\n`);
      }

      const exitCode = await this.spawnProcess(scriptPath, scriptArgs);

      return { success: exitCode === 0, exitCode: exitCode as any };
    } catch (err) {
      return this.error(`Run failed: ${(err as Error).message}`, options);
    } finally {
      // Clean up temp directory
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }

  protected parseArgs(args: string[]): { flags: RunFlags; filePath?: string; scriptArgs: string[] } {
    const flags: RunFlags = {};
    let filePath: string | undefined;
    const scriptArgs: string[] = [];
    let parsingScriptArgs = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (parsingScriptArgs) {
        scriptArgs.push(arg);
        continue;
      }

      if (arg === '--') {
        parsingScriptArgs = true;
        continue;
      }

      switch (arg) {
        case '--path':
        case '-p':
          flags.path = args[++i];
          break;
        default:
          if (!arg.startsWith('-')) {
            if (!filePath) {
              filePath = arg;
            } else {
              // Positional args after file are treated as script args
              scriptArgs.push(arg);
              parsingScriptArgs = true;
            }
          }
      }
    }

    return { flags, filePath, scriptArgs };
  }

  private async spawnProcess(scriptPath: string, args: string[]): Promise<number> {
    return new Promise((resolve) => {
      // Determine runner
      let command = 'node';
      let spawnArgs = [scriptPath, ...args];

      if (scriptPath.endsWith('.py')) {
        command = 'python3';
      } else if (scriptPath.endsWith('.sh')) {
        command = 'bash';
      } else if (scriptPath.endsWith('.ts')) {
        command = 'node';
        // Use ts-node if available, or just node if it can handle it (node 22+ with flags)
        // For simplicity, we assume node can handle it or the user has a loader
        spawnArgs = ['--experimental-strip-types', scriptPath, ...args];
      }

      const child = spawn(command, spawnArgs, {
        stdio: 'inherit',
        env: {
            ...process.env,
            JREF_TEMP_DIR: dirname(scriptPath)
        }
      });

      child.on('close', (code) => {
        resolve(code || 0);
      });

      child.on('error', (err) => {
        console.error(`Failed to start process: ${err.message}`);
        resolve(1);
      });
    });
  }
}
