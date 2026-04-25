
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { loadSnapshotFromFile } from '../utils/streaming-json.js';

export class PatchCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'patch',
    description: 'Update/add files and metadata in a snapshot',
    usage: 'jref patch [path] [content] [file.json]',
    options: [
      {
        flags: '--instruction <text>',
        description: 'Update/add instructions in the snapshot'
      },
      {
        flags: '--summary <text>',
        description: 'Update/add summary in the snapshot'
      }
    ],
    examples: [
      'jref patch src/main.ts "new content" snapshot.json > updated.json',
      'cat fix.ts | jref patch src/main.ts snapshot.json > updated.json',
      'jref patch --instruction "New instructions" snapshot.json'
    ],
    workflows: [
      'In-Place Updates: Modify snapshot content without needing a full extraction/re-pack cycle.',
      'Metadata Refinement: Update AI context or summaries within an existing snapshot.',
      'Surgical Fixes: Pipe a bug fix directly into a snapshot using stdin.',
      'Incremental Building: Build a project snapshot file-by-file through a series of patches.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath, content, snapshotFile } = this.parseArgs(args);

      let snapshot: ProjectSnapshot;
      
      // 1. Get snapshot source
      if (context.snapshot) {
        snapshot = context.snapshot;
      } else if (snapshotFile) {
        snapshot = await loadSnapshotFromFile(snapshotFile, options);
      } else if (context.stdinIsPipe && !content && !filePath) {
          // If no file path/content provided as args, the entire stdin might be the snapshot
          const { loadSnapshot } = await import('../utils/streaming-json.js');
          snapshot = await loadSnapshot(context.stdin, options);
      } else {
        return this.error('No snapshot source provided', options);
      }

      // 2. Update file content if provided
      if (filePath) {
        let actualContent = content;

        // If no content in args, look for it in stdin
        if (actualContent === undefined && context.stdinIsPipe) {
          actualContent = context.stdin;
        }

        if (actualContent !== undefined) {
          // Check if it's a new file
          const isNew = snapshot.files[filePath] === undefined;
          
          snapshot.files[filePath] = actualContent;

          if (isNew) {
            // Simple update to directory structure
            snapshot.directoryStructure += `\n${filePath}`;
          }
        }
      }

      // 3. Update metadata if provided
      if (flags.instruction) {
        snapshot.instruction = flags.instruction as string;
      }
      if (flags.summary) {
        snapshot.fileSummary = flags.summary as string;
      }

      // 4. Output the result
      const output = JSON.stringify(snapshot, null, 2);
      
      return this.success(output);

    } catch (err) {
      return this.error(`Patch failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    flags: Record<string, unknown>; 
    filePath?: string;
    content?: string;
    snapshotFile?: string;
  } {
    const flags: Record<string, unknown> = {};
    const positional: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--instruction') {
        flags.instruction = args[++i];
      } else if (arg === '--summary') {
        flags.summary = args[++i];
      } else if (!arg.startsWith('-')) {
        positional.push(arg);
      }
    }

    // Identify positional arguments based on count
    // pattern: [path] [content] [snapshotFile]
    let filePath: string | undefined;
    let content: string | undefined;
    let snapshotFile: string | undefined;

    if (positional.length === 1) {
      // Could be the path (content from stdin) or snapshot file (metadata only)
      if (positional[0].endsWith('.json')) {
        snapshotFile = positional[0];
      } else {
        filePath = positional[0];
      }
    } else if (positional.length === 2) {
      if (positional[1].endsWith('.json')) {
        filePath = positional[0];
        snapshotFile = positional[1];
      } else {
        filePath = positional[0];
        content = positional[1];
      }
    } else if (positional.length >= 3) {
      filePath = positional[0];
      content = positional[1];
      snapshotFile = positional[2];
    }

    return { flags, filePath, content, snapshotFile };
  }
}
