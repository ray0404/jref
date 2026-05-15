import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { runTool } from '../utils/tool-runner.js';
import { parserRegistry } from '../parsers/index.js';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class ToolCommand extends Command {
  readonly definition = {
    name: 'tool',
    description: 'Execute a tool and normalize its output to JSON',
    usage: 'jref tool [options] <command> [args...]',
    options: [
      {
        flags: '--parser, -p <name>',
        description: 'Specify a parser to use'
      },
      {
        flags: '--raw, -r',
        description: 'Output raw stdout even if a parser is available'
      }
    ],
    examples: [
      'jref tool ls -la',
      'jref tool --parser ls ls -la',
      'jref tool uptime'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    if (args.length === 0) {
      return this.error('No command specified', options);
    }

    const { flags, command, commandArgs } = this.parseArgs(args);
    const parserName = flags.parser as string | undefined;
    const isRaw = flags.raw as boolean || false;

    try {
      const result = await runTool(command, commandArgs);
      
      if (result.exitCode !== 0 && !result.stdout) {
        return this.error(`Command failed with exit code ${result.exitCode}: ${result.stderr}`, options);
      }

      let output: any = result.stdout;
      let usedParser = false;

      if (!isRaw) {
        const parser = parserName 
          ? parserRegistry.get(parserName) 
          : parserRegistry.findForCommand(command);

        if (parser) {
          try {
            output = parser.parse(result.stdout, { command, args: commandArgs });
            usedParser = true;
          } catch (err) {
            this.logDebug(err as Error, { command, commandArgs, stdout: result.stdout });
            // Fallback to raw if parser fails
            output = {
              error: 'Parser failed',
              message: (err as Error).message,
              raw: result.stdout,
              stderr: result.stderr,
              exitCode: result.exitCode
            };
          }
        } else if (parserName) {
          const err = new Error(`Parser "${parserName}" not found`);
          this.logDebug(err, { command, commandArgs, parserName });
          output = {
            error: 'Parser not found',
            message: err.message,
            raw: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode
          };
        }
      }

      if (options.json || usedParser) {
        if (typeof output === 'string') {
          output = { stdout: output, stderr: result.stderr, exitCode: result.exitCode };
        }
        this.print(output, options);
      } else {
        process.stdout.write(output);
        if (result.stderr) {
          process.stderr.write(result.stderr);
        }
      }

      return this.success(undefined, output);
    } catch (err) {
      const errorMsg = `Tool execution failed: ${(err as Error).message}`;
      this.logDebug(err as Error, { command, commandArgs });
      
      if (options.json) {
        const errorData = {
          error: 'Execution failed',
          message: (err as Error).message,
          command,
          args: commandArgs
        };
        this.print(errorData, options);
        return this.success(undefined, errorData); // Standardized error object to stdout
      }
      
      return this.error(errorMsg, options);
    }
  }

  protected parseArgs(args: string[]): { flags: Record<string, unknown>; command: string; commandArgs: string[] } {
    const flags: Record<string, unknown> = {};
    let command = '';
    const commandArgs: string[] = [];
    let parsingFlags = true;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (parsingFlags && arg.startsWith('-')) {
        if (arg === '--parser' || arg === '-p') {
          flags.parser = args[++i];
        } else if (arg === '--raw' || arg === '-r') {
          flags.raw = true;
        } else {
          // Unknown flag for tool command, assume it's part of the target command
          parsingFlags = false;
          command = arg;
        }
      } else {
        if (!command) {
          command = arg;
          parsingFlags = false;
        } else {
          commandArgs.push(arg);
        }
      }
    }

    return { flags, command, commandArgs };
  }

  private logDebug(error: Error, context: any): void {
    const debugDir = '.jref';
    if (!existsSync(debugDir)) {
      try {
        mkdirSync(debugDir);
      } catch (err) {
        // Ignore
      }
    }

    const logFile = join(debugDir, 'debug.log');
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context
    };

    try {
      appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      // Ignore
    }
  }
}
