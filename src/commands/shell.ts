/**
 * Shell Command
 * Start an interactive Node.js REPL with the snapshot context
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import * as repl from 'node:repl';
import * as vm from 'node:vm';
import { writeFileSync } from 'node:fs';

export class ShellCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'shell',
    description: 'Start an interactive Node.js REPL with the snapshot context',
    usage: 'jref shell [snapshot.json]',
    options: [],
    examples: [
      'jref shell snapshot.json',
      'jref pack . | jref shell'
    ],
    workflows: [
      'Programmatic Exploration: Inspect the snapshot structure using standard JavaScript.',
      'Surgical Mutation: Modify file content or metadata directly in memory.',
      'Batch Updates: Apply programmatic changes across multiple files using loops.',
      'Snapshot Persistence: Use .save to commit your in-memory changes back to disk.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotFile } = this.parseArgs(args);
      let snapshot = await this.getSnapshot(context, options, snapshotFile);

      if (!options.silent) {
        console.error('🚀 Starting jref shell...');
        console.error('💡 Context variables: ctx (full snapshot), files (files map)');
        console.error('💡 Custom commands: .save [filename], .reload');
      }

      // Start the REPL
      const replServer = repl.start({
        prompt: 'jref> ',
        useGlobal: false,
        eval: this.createCustomEval()
      });

      // Bind context
      replServer.context.ctx = snapshot;
      replServer.context.files = snapshot.files;

      // Register .save command
      replServer.defineCommand('save', {
        help: 'Save the current context snapshot to a file',
        action: (filename?: string) => {
          const targetPath = filename?.trim() || snapshotFile;
          if (!targetPath || targetPath === '-') {
            console.error('❌ Error: No output filename specified. Usage: .save [filename]');
            replServer.displayPrompt();
            return;
          }
          try {
            writeFileSync(targetPath, JSON.stringify(replServer.context.ctx, null, 2));
            console.log(`✅ Snapshot saved to ${targetPath}`);
          } catch (err) {
            console.error(`❌ Save failed: ${(err as Error).message}`);
          }
          replServer.displayPrompt();
        }
      });

      // Register .reload command
      replServer.defineCommand('reload', {
        help: 'Reload the snapshot from disk',
        action: async () => {
          if (!snapshotFile || snapshotFile === '-') {
            console.error('❌ Error: Cannot reload from stdin or unknown file.');
            replServer.displayPrompt();
            return;
          }
          try {
            const { loadSnapshotFromFile } = await import('../utils/streaming-json.js');
            snapshot = await loadSnapshotFromFile(snapshotFile, options);
            replServer.context.ctx = snapshot;
            replServer.context.files = snapshot.files;
            console.log(`✅ Snapshot reloaded from ${snapshotFile}`);
          } catch (err) {
            console.error(`❌ Reload failed: ${(err as Error).message}`);
          }
          replServer.displayPrompt();
        }
      });

      // Wait for exit
      return new Promise((resolvePromise) => {
        replServer.on('exit', () => {
          if (!options.silent) console.error('\n👋 REPL session ended.');
          resolvePromise(this.success());
        });
      });

    } catch (err) {
      return this.error(`Shell failed: ${(err as Error).message}`, options);
    }
  }

  private createCustomEval() {
    return async (cmd: string, context: any, filename: string, callback: (err: Error | null, result?: any) => void) => {
      try {
        // Ensure context is contextified (needed for manual vm.runInContext)
        if (!vm.isContext(context)) {
          vm.createContext(context);
        }

        // Run the script in the provided context
        let result = vm.runInContext(cmd, context, { filename });

        // Handle Promises to catch async rejections
        if (result && typeof result.then === 'function') {
          try {
            result = await result;
            callback(null, result);
          } catch (asyncErr) {
            // Return error as result to prevent crash
            callback(null, asyncErr);
          }
        } else {
          callback(null, result);
        }
      } catch (err: any) {
        if (this.isRecoverableError(err)) {
          return callback(new repl.Recoverable(err));
        }
        // Return error as result to prevent crash
        callback(null, err);
      }
    };
  }

  private isRecoverableError(error: Error) {
    if (error.name === 'SyntaxError') {
      return /^(Unexpected end of input|Unexpected token)/.test(error.message);
    }
    return false;
  }

  protected parseArgs(args: string[]): { snapshotFile?: string } {
    let snapshotFile: string | undefined;
    for (const arg of args) {
      if (!arg.startsWith('-')) {
        snapshotFile = arg;
        break;
      }
    }
    return { snapshotFile };
  }
}
