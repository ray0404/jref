/**
 * Query Command
 * Retrieve content of a specific file path or perform semantic search from the snapshot
 * Designed for AI agent usage with --raw flag support
 * Supports streaming for large JSON snapshots
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { generateEmbedding, cosineSimilarity } from '../utils/embeddings.js';

interface QueryFlags {
  path?: string;
  raw?: boolean;
  lineStart?: number;
  lineEnd?: number;
  searchBinaries?: boolean;
  semantic?: string;
  topK?: number;
}

export class QueryCommand extends Command {
  readonly definition = {
    name: 'query',
    description: 'Get content of a specific file path or perform semantic search from the snapshot',
    usage: 'jref query [options] [file]',
    options: [
      {
        flags: '--semantic, -s <query>',
        description: 'Perform a natural language semantic search across code chunks'
      },
      {
        flags: '--top-k <number>',
        description: 'Number of top semantic results to return (default: 5)'
      },
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
      },
      {
        flags: '--search-binaries',
        description: 'Allow querying raw content of binary files'
      }
    ],
    examples: [
      'jref query --semantic "How is authentication handled?" snapshot.json',
      'jref query --path "src/main.ts" snapshot.json',
      'jref query --path "src/main.ts" --raw snapshot.json',
      'jref query --path "README.md" --json snapshot.json',
      'cat snapshot.json | jref query --path "src/index.ts"',
      'jref query --path "src/utils.ts" --line-start 10 --line-end 50 snapshot.json'
    ],
    workflows: [
      'Semantic Search: Find relevant code blocks using natural language queries.',
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

      if (!flags.path && !flags.semantic) {
        return this.error('Either --path <path> or --semantic <query> is required', options);
      }

      if (flags.semantic) {
        return this.executeSemanticQuery(flags.semantic, flags.topK || 5, filePath, options, context);
      }

      let fileContent: string | undefined;
      let encodings: Record<string, string> = {};

      if (options.jq) {
        // Use full loading when JQ is active
        const snapshot = await this.getSnapshot(context, options, filePath);
        fileContent = snapshot.files[flags.path!];
        encodings = snapshot.encodings || {};
      } else {
        // Use streaming processor to avoid OOM
        await processSnapshot(
          filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
          {
            onMetadata: (key, value) => {
              if (key === 'encodings') Object.assign(encodings, value);
            },
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

      const isBinary = encodings[flags.path!] === 'base64';
      if (isBinary && !flags.searchBinaries && !options.json) {
        const decodedSize = Buffer.byteLength(fileContent, 'base64');
        const placeholder = `[ Binary Asset | ${flags.path} | ${this.formatBytes(decodedSize)} ]\n(Use --search-binaries to see raw Base64 content)`;
        this.outputContent(placeholder, flags, options);
        return this.success();
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
        case '--semantic':
        case '-s':
          flags.semantic = args[++i];
          break;
        case '--top-k':
          flags.topK = parseInt(args[++i], 10);
          break;
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
        case '--search-binaries':
          flags.searchBinaries = true;
          break;
        default:
          if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    return { flags, filePath };
  }

  private async executeSemanticQuery(
    query: string,
    topK: number,
    snapshotPath: string | undefined,
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    const snapshot = await this.getSnapshot(context, options, snapshotPath);
    
    if (!snapshot.chunks || snapshot.chunks.length === 0) {
      return this.error('Snapshot does not contain semantic chunks. Repack with --semantic flag.', options);
    }

    if (!options.silent) {
      console.error(`🧠 Embedding query: "${query}"...`);
    }

    const queryEmbedding = await generateEmbedding(query);
    
    const results = snapshot.chunks
      .map(chunk => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding || [])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (options.json) {
      return this.success(JSON.stringify(results, null, 2));
    }

    // Create a micro-snapshot for the results
    const microSnapshot: any = {
      query,
      results: results.map(r => {
        // Extract imports from the original file
        const fileContent = snapshot.files[r.chunk.filePath];
        const imports = this.extractImports(fileContent || '');
        
        return {
          filePath: r.chunk.filePath,
          lines: `${r.chunk.startLine}-${r.chunk.endLine}`,
          type: r.chunk.type,
          name: r.chunk.name,
          score: r.score.toFixed(4),
          imports: imports.length > 0 ? imports : undefined,
          content: r.chunk.content
        };
      })
    };

    if (options.raw) {
      process.stdout.write(JSON.stringify(microSnapshot, null, 2));
      return this.success();
    }

    console.log(`\n🔍 Semantic Search Results for: "${query}"`);
    console.log('─'.repeat(50));
    
    results.forEach((res, i) => {
      const imports = this.extractImports(snapshot.files[res.chunk.filePath] || '');
      console.log(`[${i+1}] ${res.chunk.filePath} (${res.chunk.type}${res.chunk.name ? ': ' + res.chunk.name : ''}) - Score: ${res.score.toFixed(4)}`);
      console.log(`Lines: ${res.chunk.startLine}-${res.chunk.endLine}`);
      if (imports.length > 0) {
        console.log(`Imports: ${imports.length} found`);
      }
      console.log('─'.repeat(20));
      console.log(res.chunk.content);
      console.log('─'.repeat(50));
    });

    return this.success();
  }

  private extractImports(content: string): string[] {
    const importPatterns = [
      /^import\s+.*from\s+['"].*['"]/gm,
      /^import\s+['"].*['"]/gm,
      /^from\s+.*\s+import\s+.*/gm,
      /^const\s+.*\s+=\s+require\(['"].*['"]\)/gm,
      /^extern\s+crate\s+.*/gm,
      /^use\s+.*/gm
    ];

    const imports: string[] = [];
    for (const pattern of importPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        imports.push(...matches);
      }
    }
    return [...new Set(imports)];
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
      process.stdout.write(content);
      return;
    }

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
