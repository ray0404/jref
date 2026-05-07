import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { setValueByPath } from '../utils/path-resolver.js';

export class SetCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'set',
    description: 'Update or add a value in a snapshot using dot/bracket notation',
    usage: 'jref set <path> <value> [snapshot.json]',
    options: [],
    examples: [
      'jref set metadata.instruction "New instructions" snapshot.json',
      'jref set "files[\'new-file.ts\']" "console.log(\'new\');" snapshot.json',
      'cat snapshot.json | jref set version 2.0.0 > updated.json'
    ],
    workflows: [
      'Surgical Mutation: Update specific parts of a snapshot without full extraction.',
      'Automation: Programmatically update metadata or content in existing snapshots.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { path, rawValue, snapshotFile } = this.parseArgs(args);

      if (!path) {
        return this.error('No path provided', options);
      }

      if (rawValue === undefined) {
        return this.error('No value provided', options);
      }

      const snapshot = await this.getSnapshot(context, options, snapshotFile);
      
      // Try to parse value as JSON
      let value: any = rawValue;
      try {
        // Only try to parse if it looks like JSON (starts with {, [, ", or is true/false/number)
        const trimmed = rawValue.trim();
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          trimmed === 'true' || trimmed === 'false' || 
          trimmed === 'null' || !isNaN(Number(trimmed))
        ) {
          value = JSON.parse(trimmed);
        }
      } catch {
        // If parsing fails, keep it as raw string
        value = rawValue;
      }

      setValueByPath(snapshot, path, value);

      // Output the modified snapshot
      const output = JSON.stringify(snapshot, null, 2);
      
      return this.success(output);

    } catch (err) {
      return this.error(`Set failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    path?: string;
    rawValue?: string;
    snapshotFile?: string;
  } {
    const positional = args.filter(arg => !arg.startsWith('-'));
    
    return {
      path: positional[0],
      rawValue: positional[1],
      snapshotFile: positional[2]
    };
  }
}
