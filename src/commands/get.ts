import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { getValueByPath } from '../utils/path-resolver.js';

export class GetCommand extends Command {
  readonly definition = {
    name: 'get',
    description: 'Retrieve a value from a snapshot using dot/bracket notation',
    usage: 'jref get <path> [snapshot.json]',
    options: [],
    examples: [
      'jref get metadata.instruction snapshot.json',
      'jref get "files[\'src/main.ts\']" snapshot.json',
      'cat snapshot.json | jref get directoryStructure --raw'
    ],
    workflows: [
      'Surgical Querying: Extract specific metadata or file content without external tools.',
      'Automation: Use in scripts to pull values from snapshots for downstream processing.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { path, snapshotFile } = this.parseArgs(args);

      if (!path) {
        return this.error('No path provided', options);
      }

      const snapshot = await this.getJSON(context, options, snapshotFile);
      const value = getValueByPath(snapshot, path);

      if (value === undefined) {
        return this.error(`Path not found: ${path}`, options);
      }

      // If raw is requested and it's a string, print it raw
      if (options.raw && typeof value === 'string') {
        return this.success(value);
      }

      // Otherwise use standard formatting (JSON-stringified for objects/arrays)
      const output = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      
      return this.success(output);

    } catch (err) {
      return this.error(`Get failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    path?: string;
    snapshotFile?: string;
  } {
    const positional = args.filter(arg => !arg.startsWith('-'));
    
    return {
      path: positional[0],
      snapshotFile: positional[1]
    };
  }
}
