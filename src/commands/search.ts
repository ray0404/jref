/**
 * Search Command
 * High-speed regex or keyword searching across all entries in the files object
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, SearchResult, SearchMatch } from '../types/index.js';
import { loadSnapshot } from '../utils/streaming-json.js';

interface SearchFlags {
  regex?: boolean;
  caseInsensitive?: boolean;
  files?: string[];
  maxResults?: number;
  context?: number;
}

export class SearchCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'search',
    description: 'High-speed regex or keyword searching across all file entries',
    usage: 'jref search <pattern> [options] [file]',
    examples: [
      'jref search "function" snapshot.json',
      'jref search "class.*Controller" --regex snapshot.json',
      'jref search "TODO" --case-insensitive snapshot.json',
      'cat snapshot.json | jref search "export"',
      'jref search "async" --json snapshot.json'
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

      // Load snapshot
      const snapshot = await loadSnapshot(
        filePath ? await this.readFile(filePath) : context.stdin
      );

      // Perform search
      const results = this.performSearch(snapshot, pattern, flags);

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
          flags.files = [];
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

  private async readFile(filePath: string): Promise<string> {
    const { readFileSync } = await import('fs');
    return readFileSync(filePath, 'utf8');
  }

  private performSearch(
    snapshot: { files: Record<string, string> },
    pattern: string,
    flags: SearchFlags
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const regex = this.createRegex(pattern, flags);
    const maxResults = flags.maxResults || 1000;

    for (const [filePath, content] of Object.entries(snapshot.files)) {
      const matches = this.searchContent(content, regex, flags.context || 0);

      if (matches.length > 0) {
        results.push({
          filePath,
          matches,
          score: matches.length
        });

        // Early termination if we have enough results
        if (results.length >= maxResults) {
          break;
        }
      }
    }

    // Sort by score (most matches first)
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  private createRegex(pattern: string, flags: SearchFlags): RegExp {
    if (flags.regex) {
      const flagStr = flags.caseInsensitive ? 'i' : '';
      return new RegExp(pattern, flagStr);
    }

    // Escape regex special characters for literal search
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flagStr = flags.caseInsensitive ? 'i' : '';
    return new RegExp(escaped, flagStr);
  }

  private searchContent(content: string, regex: RegExp, _contextLines: number): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const lines = content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match: RegExpExecArray | null;

      // Reset regex lastIndex for global matching
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

  private outputResults(results: SearchResult[], options: CLIOptions, _flags: SearchFlags): void {
    if (options.json) {
      this.print({ results }, options);
      return;
    }

    if (results.length === 0) {
      console.log('No matches found.');
      return;
    }

    console.log(`\n🔍 Found ${results.length} file(s) with matches:\n`);

    for (const result of results) {
      console.log(`📄 ${result.filePath} (${result.matches.length} match${result.matches.length !== 1 ? 'es' : ''})`);

      // Show match context
      for (const match of result.matches.slice(0, 5)) {
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