/**
 * Bin Command
 * Executes scripts embedded within jref snapshots located in $JREF_BIN_PATH
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { RunCommand } from './run.js';
import { existsSync, appendFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

export class BinCommand extends Command {
  readonly definition = {
    name: 'bin',
    description: 'Execute a script from a snapshot in $JREF_BIN_PATH',
    usage: 'jref bin <snapshot-name> <script-path> [args...] [-- script-args...]',
    options: [],
    examples: [
      'jref bin my-tool setup.ts',
      'jref bin my-tool main.js -- --port 8080'
    ],
    workflows: [
      'Path Resolution: Scans $JREF_BIN_PATH, defaulting to local .jref/bin/ and global ~/.jref/bin/.',
      'Argument Isolation: Uses -- to separate jref args from script args.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotName, scriptPath, jrefArgs, scriptArgs } = this.parseArgs(args);

      if (!snapshotName) {
        return this.error('Snapshot name is required', options);
      }

      if (!scriptPath) {
        return this.error('Script path within snapshot is required', options);
      }

      const snapshotFile = this.resolveSnapshotFile(snapshotName);
      if (!snapshotFile) {
        const message = `Snapshot not found: ${snapshotName} in $JREF_BIN_PATH (checked .jref/bin and ~/.jref/bin)`;
        this.logDiagnostic(message);
        return this.error(message, options);
      }

      // Reuse RunCommand logic
      const runCommand = new RunCommand();
      // We pass the absolute path to the resolved snapshot file
      const runArgs = ['--path', scriptPath, snapshotFile, ...jrefArgs];
      if (scriptArgs.length > 0) {
        runArgs.push('--', ...scriptArgs);
      }

      return await runCommand.execute(runArgs, options, context);
    } catch (err) {
      const message = `Bin failed: ${(err as Error).message}`;
      this.logDiagnostic(message);
      return this.error(message, options);
    }
  }

  protected parseArgs(args: string[]): { 
    snapshotName: string; 
    scriptPath: string; 
    jrefArgs: string[]; 
    scriptArgs: string[] 
  } {
    let snapshotName = '';
    let scriptPath = '';
    const jrefArgs: string[] = [];
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

      if (!snapshotName && !arg.startsWith('-')) {
        snapshotName = arg;
      } else if (!scriptPath && !arg.startsWith('-')) {
        scriptPath = arg;
      } else {
        jrefArgs.push(arg);
      }
    }

    return { snapshotName, scriptPath, jrefArgs, scriptArgs };
  }

  private resolveSnapshotFile(name: string): string | null {
    const binPaths = process.env.JREF_BIN_PATH 
      ? process.env.JREF_BIN_PATH.split(':') 
      : [
          resolve('.jref/bin'),
          join(homedir(), '.jref/bin')
        ];

    // Common extensions to check
    const extensions = ['', '.json', '.jref'];

    for (const binPath of binPaths) {
      for (const ext of extensions) {
        const fullPath = join(binPath, name + ext);
        if (existsSync(fullPath)) {
          return fullPath;
        }
      }
    }

    return null;
  }

  private logDiagnostic(message: string): void {
    try {
      const logDir = resolve('.jref');
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
      const logPath = join(logDir, 'debug.log');
      const timestamp = new Date().toISOString();
      appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (err) {
      // Ignore logging errors
    }
  }
}
