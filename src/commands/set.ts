import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { setValueByPath } from '../utils/path-resolver.js';

export class SetCommand extends Command {
  readonly definition = {
    name: 'set',
    description: 'Update or add a value in a snapshot using dot/bracket notation',
    usage: 'jref set <path> <value> [snapshot.json]',
    options: [
      { flags: '--write, -w', description: 'Write the changes back to the source file in-place' }
    ],
    examples: [
      'jref set metadata.instruction "New instructions" snapshot.json --write',
      'jref set "files[\'new-file.ts\']" "console.log(\'new\');" snapshot.json -w',
      'cat snapshot.json | jref set version 2.0.0 > updated.json'
    ],
    workflows: [
      'Surgical Mutation: Update specific parts of a snapshot without full extraction.',
      'In-place Update: Use --write to update the original file safely.',
      'Automation: Programmatically update metadata or content in existing snapshots.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { path, rawValue, snapshotFile, writeInPlace } = this.parseArgs(args);

      if (!path) {
        return this.error('No path provided', options);
      }

      if (rawValue === undefined) {
        return this.error('No value provided', options);
      }

      // If we are writing in-place, we must have a file path
      if (writeInPlace && (!snapshotFile || snapshotFile === '-')) {
        return this.error('--write requires a valid file path', options);
      }

      const snapshot = await this.getJSON(context, options, snapshotFile);
      
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

      // Schema detection: If it looks like a jref snapshot and we modified files,
      // update the directory structure
      if (
        snapshot &&
        typeof snapshot === 'object' &&
        'files' in snapshot &&
        typeof snapshot.files === 'object' &&
        (path === 'files' || path.startsWith('files.') || path.startsWith('files['))
      ) {
        const { generateDirectoryStructure } = await import('../utils/streaming-json.js');
        snapshot.directoryStructure = generateDirectoryStructure(Object.keys(snapshot.files || {}));
      }

      // Output the modified snapshot
      const output = JSON.stringify(snapshot, null, 2);
      
      if (writeInPlace && snapshotFile) {
        const { writeFileSync } = await import('fs');
        writeFileSync(snapshotFile, output, 'utf8');
        return this.success(options.silent ? '' : `✅ Updated ${snapshotFile}`);
      }
      
      return this.success(output);

    } catch (err) {
      return this.error(`Set failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    path?: string;
    rawValue?: string;
    snapshotFile?: string;
    writeInPlace?: boolean;
  } {
    const positional = args.filter(arg => !arg.startsWith('-'));
    const writeInPlace = args.includes('--write') || args.includes('-w');
    
    return {
      path: positional[0],
      rawValue: positional[1],
      snapshotFile: positional[2],
      writeInPlace
    };
  }
}
