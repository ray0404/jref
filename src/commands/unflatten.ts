import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { unflattenLines } from '../utils/flatten.js';

export class UnflattenCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'unflatten',
    description: 'Reconstruct a jref snapshot from flattened assignments',
    usage: 'jref unflatten [assignments.txt]',
    options: [],
    examples: [
      'jref unflatten assignments.txt',
      'cat assignments.txt | jref unflatten > reconstructed.json'
    ],
    workflows: [
      'Round-trip Transformation: Flatten for editing, then unflatten back to JSON.',
      'Snapshot Assembly: Construct a snapshot from a series of manual assignments.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { assignmentsFile } = this.parseArgs(args);

      let content: string;
      
      // 1. Get assignments content
      if (assignmentsFile) {
          const { readFile } = await import('fs/promises');
          content = await readFile(assignmentsFile, 'utf8');
      } else if (context.stdinIsPipe) {
          content = context.stdin || '';
      } else {
        return this.error('No input assignments provided', options);
      }

      // 2. Unflatten
      const lines = content.split('\n');
      const snapshot = unflattenLines(lines);

      // 3. Output
      const output = JSON.stringify(snapshot, null, 2);
      
      return this.success(output);

    } catch (err) {
      return this.error(`Unflatten failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    assignmentsFile?: string;
  } {
    let assignmentsFile: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!arg.startsWith('-')) {
        assignmentsFile = arg;
      }
    }

    return { assignmentsFile };
  }
}
