
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { stripImplementation } from '../utils/format.js';

export class SummarizeCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'summarize',
    description: 'Generate token-efficient architectural map by stripping implementation details',
    usage: 'jref summarize [file.json]',
    options: [],
    examples: [
      'jref summarize snapshot.json > map.json',
      'cat snapshot.json | jref summarize'
    ],
    workflows: [
      'Context Optimization: Reduce the size of code snapshots to fit within AI token limits.',
      'Interface Mapping: Generate a high-level overview of project structure and public APIs.',
      'Dependency Analysis: Inspect imports and exports across the project without the noise of implementation.',
      'Architectural Review: Use the summary to understand the overall design and flow of the system.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotFile } = this.parseArgs(args);
      
      let snapshot: ProjectSnapshot;
      if (context.snapshot) {
        snapshot = context.snapshot;
      } else if (snapshotFile) {
        const { loadSnapshotFromFile } = await import('../utils/streaming-json.js');
        snapshot = await loadSnapshotFromFile(snapshotFile, options);
      } else {
        snapshot = await this.getSnapshot(context, options, snapshotFile);
      }
      
      const summarizedFiles: Record<string, string> = {};
      
      for (const [path, content] of Object.entries(snapshot.files)) {
        // Skip non-code files
        if (path.endsWith('.json') || path.endsWith('.md') || path.endsWith('.txt')) {
          summarizedFiles[path] = content;
          continue;
        }
        
        summarizedFiles[path] = stripImplementation(content);
      }

      const summary: ProjectSnapshot = {
        ...snapshot,
        files: summarizedFiles,
        fileSummary: `Summarized architectural map of ${Object.keys(snapshot.files).length} files.`
      };

      const output = JSON.stringify(summary, null, 2);
      
      if (options.json || options.silent) {
        return this.success(output);
      }

      console.log(output);
      return this.success(output);

    } catch (err) {
      return this.error(`Summarize failed: ${(err as Error).message}`, options);
    }
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
