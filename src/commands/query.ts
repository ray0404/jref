/**
 * Query Command
 * Retrieve content of a specific file path from the snapshot
 * Designed for AI agent usage with --raw flag support
 * Supports streaming for large JSON snapshots
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

interface QueryFlags {
  path?: string;
  raw?: boolean;
  lineStart?: number;
  lineEnd?: number;
}

export class QueryCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'query',
    description: 'Get content of a specific file path from the snapshot',
    usage: 'jref query --path <path> [file]',
    options: [
      {
        flags: '--path, -p <path>',
        description: 'Path of the file to query within the snapshot'
      },
      {
        flags: '--raw, -r',
        description: 'Output pure file content without headers or formatting'
      },
      {
        flags: '--line-start <number>',
        description: 'Start reading from this 1-indexed line'
      },
      {
        flags: '--line-end <number>',
        description: 'End reading at this 1-indexed line'
      }
    ],
    examples: [
      'jref query --path "src/main.ts" snapshot.json',
      'jref query --path "src/main.ts" --raw snapshot.json',
      'jref query --path "README.md" --json snapshot.json',
      'cat snapshot.json | jref query --path "src/index.ts"',
      'jref query --path "src/utils.ts" --line-start 10 --line-end 50 snapshot.json'
    ],
    workflows: [
      'Targeted Reading: Retrieve specific files from large snapshots for analysis.',
      'Agent Context Injection: Use --raw to provide pure code content to AI agents.',
      'Snippet Extraction: Use --line-start and --line-end to read only relevant portions of large files.',
      'Verification: Quickly check the content of a file within a snapshot without extraction.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args);

      if (!flags.path) {
        return this.error('File path is required (--path <path>)', options);
      }

      let fileContent: string | undefined;

      if (options.jq) {
        // Use full loading when JQ is active
        const snapshot = await this.getSnapshot(context, options, filePath);
        fileContent = snapshot.files[flags.path!];
      } else {
        // Use streaming processor to avoid OOM
        // We can't easily "early terminate" with the current processSnapshot implementation
        // but it will still avoid loading all other files into memory
        await processSnapshot(
          filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
          {
            onFile: (path, content) => {
              if (path === flags.path) {
                fileContent = content;
              }
            }
          }
        );
      }

      if (fileContent === undefined) {
        return this.error(`File not found in snapshot: ${flags.path}`, options, 2);
      }

      // Apply line range if specified
      let content = fileContent;
      if (flags.lineStart !== undefined || flags.lineEnd !== undefined) {
        content = this.extractLineRange(
          fileContent,
          flags.lineStart,
          flags.lineEnd
        );
      }

      // Output content
      this.outputContent(content, flags, options);

      return this.success();
    } catch (err) {
      return this.error(`Query failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: QueryFlags; filePath?: string } {
    const flags: QueryFlags = {};
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--path':
        case '-p':
          flags.path = args[++i];
          break;
        case '--raw':
        case '-r':
          flags.raw = true;
          break;
        case '--line-start':
          flags.lineStart = parseInt(args[++i], 10);
          break;
        case '--line-end':
          flags.lineEnd = parseInt(args[++i], 10);
          break;
        default:
          if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    return { flags, filePath };
  }

  private extractLineRange(
    content: string,
    start?: number,
    end?: number
  ): string {
    const lines = content.split('\n');
    const startIdx = start ? Math.max(0, start - 1) : 0;
    const endIdx = end ? Math.min(lines.length, end) : lines.length;

    return lines.slice(startIdx, endIdx).join('\n');
  }

  private outputContent(
    content: string,
    flags: QueryFlags,
    options: CLIOptions
  ): void {
    // --raw or --json flag for AI agents
    if (options.json) {
      this.print(
        {
          path: flags.path,
          content,
          lineCount: content.split('\n').length,
          byteSize: Buffer.byteLength(content, 'utf8')
        },
        options
      );
      return;
    }

    if (flags.raw || options.raw) {
      // Pure content output for AI parsing
      process.stdout.write(content);
      return;
    }

    // Human-readable with header
    console.log(`\n📄 ${flags.path}`);
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    console.log(`(${content.split('\n').length} lines, ${this.formatBytes(Buffer.byteLength(content, 'utf8'))})`);
    console.log();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
