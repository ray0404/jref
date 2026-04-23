/**
 * Search Command
 * High-speed regex or keyword searching across all entries in the files object
 * Supports streaming for large JSON snapshots
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, SearchResult, SearchMatch } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

interface SearchFlags {
  regex?: boolean;
  caseInsensitive?: boolean;
  filesOnly?: boolean;
  maxResults?: number;
  context?: number;
}

export class SearchCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'search',
    description: 'High-speed regex or keyword searching across all file entries',
    usage: 'jref search <pattern> [options] [file]',
    options: [
      {
        flags: '--regex, -r',
        description: 'Interpret pattern as a regular expression'
      },
      {
        flags: '--case-insensitive, -i',
        description: 'Perform case-insensitive search'
      },
      {
        flags: '--files, -f',
        description: 'Only output paths of matching files'
      },
      {
        flags: '--max-results, -n <number>',
        description: 'Limit total number of matches (default: 1000)'
      },
      {
        flags: '--context, -c <lines>',
        description: 'Show <lines> of context around matches'
      }
    ],
    examples: [
      'jref search "function" snapshot.json',
      'jref search "class.*Controller" --regex snapshot.json',
      'jref search "TODO" --case-insensitive snapshot.json',
      'cat snapshot.json | jref search "export"',
      'jref search "async" --json snapshot.json'
    ],
    workflows: [
      'Keyword Discovery: Use literal search to find usages of specific terms.',
      'Pattern Matching: Use regex to find complex code structures.',
      'File Filtering: Use --files to generate a list of relevant files for subsequent commands.',
      'Contextual Analysis: Use --context to understand how a match is used within its file.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { pattern, flags, filePath } = this.parseArgs(args);

      if (!pattern) {
        return this.error('Search pattern is required', options);
      }

      const results: SearchResult[] = [];
      const regex = this.createRegex(pattern, flags);
      const maxResults = flags.maxResults || 1000;

      if (options.jq) {
        // Use full loading when JQ is active
        const snapshot = await this.getSnapshot(context, options, filePath);
        for (const [path, content] of Object.entries(snapshot.files)) {
          if (results.length >= maxResults) break;
          const matches = this.searchContent(content, regex, flags.context || 0);
          if (matches.length > 0) {
            results.push({
              filePath: path,
              matches,
              score: matches.length
            });
          }
        }
      } else {
        // Use streaming processor to avoid OOM
        await processSnapshot(
          filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
          {
            onFile: (path, content) => {
              if (results.length >= maxResults) return;

              const matches = this.searchContent(content, regex, flags.context || 0);

              if (matches.length > 0) {
                results.push({
                  filePath: path,
                  matches,
                  score: matches.length
                });
              }
            }
          }
        );
      }

      // Sort by score (most matches first)
      results.sort((a, b) => b.score - a.score);

      // Format and output results
      this.outputResults(results, options, flags);

      return this.success();
    } catch (err) {
      return this.error(`Search failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { pattern?: string; flags: SearchFlags; filePath?: string } {
    const flags: SearchFlags = {};
    let pattern: string | undefined;
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--regex':
        case '-r':
          flags.regex = true;
          break;
        case '--case-insensitive':
        case '-i':
          flags.caseInsensitive = true;
          break;
        case '--files':
        case '-f':
          flags.filesOnly = true;
          break;
        case '--max-results':
        case '-n':
          flags.maxResults = parseInt(args[++i], 10) || 100;
          break;
        case '--context':
        case '-c':
          flags.context = parseInt(args[++i], 10) || 0;
          break;
        default:
          if (!pattern && !arg.startsWith('-')) {
            pattern = arg;
          } else if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    return { pattern, flags, filePath };
  }

  private createRegex(pattern: string, flags: SearchFlags): RegExp {
    let patternStr = pattern;
    if (!flags.regex) {
      // Escape regex special characters for literal search
      patternStr = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    const flagStr = flags.caseInsensitive ? 'gi' : 'g';
    return new RegExp(patternStr, flagStr);
  }

  private searchContent(content: string, regex: RegExp, _contextLines: number): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const lines = content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match: RegExpExecArray | null;

      // Reset regex lastIndex for global matching per line
      regex.lastIndex = 0;

      while ((match = regex.exec(line)) !== null) {
        matches.push({
          line: lineNum + 1,
          content: line,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });

        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }

        // Limit matches per line
        if (matches.filter((m) => m.line === lineNum + 1).length >= 100) {
          break;
        }
      }
    }

    return matches;
  }

  private outputResults(results: SearchResult[], options: CLIOptions, flags: SearchFlags): void {
    if (options.json) {
      this.print({ results }, options);
      return;
    }

    if (results.length === 0) {
      console.log('No matches found.');
      return;
    }

    if (flags.filesOnly) {
      for (const result of results) {
        console.log(result.filePath);
      }
      return;
    }

    console.log(`\n🔍 Found ${results.length} file(s) with matches:\n`);

    for (const result of results) {
      console.log(`📄 ${result.filePath} (${result.matches.length} match${result.matches.length !== 1 ? 'es' : ''})`);

      // Show match context
      const showCount = Math.min(result.matches.length, 5);
      for (let i = 0; i < showCount; i++) {
        const match = result.matches[i];
        const linePrefix = `   ${match.line}: `;
        const content = this.highlightMatch(match.content, match.startIndex, match.endIndex);
        console.log(`${linePrefix}${content}`);
      }

      if (result.matches.length > 5) {
        console.log(`   ... and ${result.matches.length - 5} more matches`);
      }
      console.log();
    }
  }

  private highlightMatch(content: string, start: number, end: number): string {
    const before = content.slice(0, start);
    const match = content.slice(start, end);
    const after = content.slice(end);

    // Simple ANSI highlight
    return `${before}\x1b[33m${match}\x1b[0m${after}`;
  }
}
