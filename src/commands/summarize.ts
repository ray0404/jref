
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';

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
        
        summarizedFiles[path] = this.stripImplementation(content);
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

  /**
   * Lightweight implementation stripping using regex
   * Handles common JS/TS/Python patterns
   */
  private stripImplementation(content: string): string {
    // 1. Strip multi-line function bodies { ... }
    // This is a naive regex and won't handle nested braces perfectly,
    // but works for top-level signatures in many cases.
    // Replace: function name(...) { ... } -> function name(...) { /* implementation stripped */ }
    
    // For MVP, we'll use a simpler line-based approach: keep lines with 'function', 'class', 'interface', 'export', 'import'
    
    const lines = content.split('\n');
    const summarizedLines = lines.filter(line => {
      const trimmed = line.trim();
      return (
        trimmed.startsWith('import ') ||
        trimmed.startsWith('export ') ||
        trimmed.includes('function ') ||
        trimmed.includes('class ') ||
        trimmed.includes('interface ') ||
        trimmed.includes('type ') ||
        trimmed.startsWith('@') || // Decorators
        trimmed.length === 0
      );
    });

    return summarizedLines.join('\n') + '\n/* ... implementation details stripped ... */';
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
