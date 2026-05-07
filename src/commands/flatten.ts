import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { loadSnapshotFromFile } from '../utils/streaming-json.js';
import { flattenObject } from '../utils/flatten.js';

export class FlattenCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'flatten',
    description: 'Flatten a nested jref snapshot into a list of assignments',
    usage: 'jref flatten [snapshot.json]',
    options: [
      {
        flags: '--prefix <name>',
        description: 'Root prefix for assignments (default: snapshot)'
      }
    ],
    examples: [
      'jref flatten snapshot.json',
      'cat snapshot.json | jref flatten > assignments.txt'
    ],
    workflows: [
      'Line-based Processing: Use grep, sed, and awk on flattened snapshots.',
      'Snapshot Auditing: Easily compare specific values across different snapshots.',
      'Surgical Mutation: Flatten, modify specific lines, and unflatten to apply changes.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotFile, prefix } = this.parseArgs(args);

      let snapshot: ProjectSnapshot;
      
      // 1. Get snapshot source
      if (context.snapshot) {
        snapshot = context.snapshot;
      } else if (snapshotFile) {
        snapshot = await loadSnapshotFromFile(snapshotFile, options);
      } else if (context.stdinIsPipe) {
          const { loadSnapshot } = await import('../utils/streaming-json.js');
          snapshot = await loadSnapshot(context.stdin, options);
      } else {
        return this.error('No snapshot source provided', options);
      }

      // 2. Flatten
      const lines = flattenObject(snapshot, prefix || 'snapshot');

      // 3. Output
      // For very large snapshots, we might want to stream this, 
      // but for now, join and return as success result.
      const output = lines.join('\n');
      
      return this.success(output);

    } catch (err) {
      return this.error(`Flatten failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    snapshotFile?: string;
    prefix?: string;
  } {
    let snapshotFile: string | undefined;
    let prefix: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--prefix') {
        prefix = args[++i];
      } else if (!arg.startsWith('-')) {
        snapshotFile = arg;
      }
    }

    return { snapshotFile, prefix };
  }
}
