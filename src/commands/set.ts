import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { setValueByPath } from '../utils/path-resolver.js';

export class SetCommand extends Command {
  readonly definition = {
    name: 'set',
    description: 'Update or add a value in a snapshot (in-place by default)',
    usage: 'jref set <path> <value> [snapshot.json]',
    options: [
      { flags: '--stdout', description: 'Print to stdout instead of updating the file in-place' }
    ],
    examples: [
      'jref set metadata.instruction "New instructions" snapshot.json',
      'jref set "files[\'new-file.ts\']" "console.log(\'new\');" snapshot.json',
      'jref set version 1.3.0 package.json --stdout',
      'cat snapshot.json | jref set version 2.0.0 > updated.json'
    ],
    workflows: [
      'Surgical Mutation: Update specific parts of a snapshot without full extraction.',
      'Default In-place: File arguments are updated in-place unless --stdout is used.',
      'Automation: Programmatically update metadata or content in existing snapshots.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { path, rawValue, snapshotFile, useStdout } = this.parseArgs(args);

      if (!path) {
        return this.error('No path provided', options);
      }

      if (rawValue === undefined) {
        return this.error('No value provided', options);
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
      
      // Determine if we should write in-place
      // Default to in-place if a file is provided and --stdout is NOT set
      const isPiped = !snapshotFile || snapshotFile === '-';
      const shouldWriteInPlace = !isPiped && !useStdout;

      if (shouldWriteInPlace && snapshotFile) {
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
    useStdout?: boolean;
  } {
    const positional = args.filter(arg => !arg.startsWith('-'));
    const useStdout = args.includes('--stdout');
    
    return {
      path: positional[0],
      rawValue: positional[1],
      snapshotFile: positional[2],
      useStdout
    };
  }
}
