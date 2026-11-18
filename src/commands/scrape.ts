/**
 * Scrape Command
 * Scrape web pages into a snapshot (files: {} + sources: [...]) using
 * the @ray0404/pyscraper-md-ts library. Registered in the command
 * registry, so `jref serve` exposes it as an MCP tool automatically.
 */

import { Command } from '../utils/command.js';
import type {
  CLIOptions,
  CommandResult,
  CommandContext,
  ProjectSnapshot,
} from '../types/index.js';
import { writeFileSync } from 'node:fs';
import { scrapeSources, type ScrapeFormat, type ScrapeSourcesOptions } from '../api/scrape.js';

type ScrapeFlags = {
  urls: string[];
  format?: ScrapeFormat;
  crawl?: boolean;
  depth?: number;
  maxPages?: number;
  onlySubpaths?: boolean;
  dynamic?: boolean;
  delay?: number;
  retries?: number;
  includeRawHtml?: boolean;
  output?: string;
};

export class ScrapeCommand extends Command {
  readonly definition = {
    name: 'scrape',
    description: 'Scrape web pages into a snapshot (Markdown + HTML per page)',
    usage: 'jref scrape <url...> [options]',
    options: [
      {
        flags: '--format <markdown|html>',
        description: 'Default representation returned by query --source-url (default: markdown; both are always stored)'
      },
      {
        flags: '--crawl',
        description: 'Follow same-domain links from the seed URLs (BFS)'
      },
      {
        flags: '--depth <number>',
        description: 'Maximum crawl depth, 0 = seed URLs only (default: 2)'
      },
      {
        flags: '--max-pages <number>',
        description: 'Maximum pages to fetch in a crawl (default: 10)'
      },
      {
        flags: '--only-subpaths',
        description: 'Only follow links under the seed URL subpaths'
      },
      {
        flags: '--dynamic',
        description: 'Render pages with a headless browser (requires Playwright + Chromium)'
      },
      {
        flags: '--delay <seconds>',
        description: 'Delay before each fetch, for politeness (default: 0)'
      },
      {
        flags: '--retries <number>',
        description: 'Retries on network/5xx failures (default: 3)'
      },
      {
        flags: '--include-raw-html',
        description: 'Also store the full raw HTML per page (roughly doubles snapshot size)'
      },
      {
        flags: '--output, -o <file>',
        description: 'Write the snapshot JSON to a file instead of stdout'
      }
    ],
    examples: [
      'jref scrape https://example.com > web.json',
      'jref scrape https://example.com --output web.json',
      'jref scrape https://example.com --crawl --depth 2 --max-pages 10',
      'jref scrape https://example.com --dynamic',
      'jref scrape https://a.example https://b.example --format html'
    ],
    workflows: [
      'Web Research: Capture reference pages (docs, articles) as Markdown alongside a code snapshot.',
      'Offline Reading: Scrape pages once, then query/search them without network access.',
      'Hybrid Snapshot: Combine with `jref pack --scrape` to bundle code and its documentation in one file.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const flags = this.parseArgs(args);

      if (flags.urls.length === 0) {
        return this.error('At least one URL is required: jref scrape <url...> ', options);
      }

      const scrapeOptions: ScrapeSourcesOptions = {
        format: flags.format ?? 'markdown',
        crawl: flags.crawl,
        depth: flags.depth,
        maxPages: flags.maxPages,
        onlySubpaths: flags.onlySubpaths,
        dynamic: flags.dynamic,
        delay: flags.delay ?? 0,
        retries: flags.retries,
        includeRawHtml: flags.includeRawHtml,
      };

      if (!options.silent) {
        console.error(`🌐 Scraping ${flags.urls.length} URL(s)${flags.crawl ? ' (crawl)' : ''}...`);
      }

      const sources = await scrapeSources(flags.urls, scrapeOptions);
      const failed = sources.filter((s) => s.error);
      if (failed.length > 0 && !options.silent) {
        for (const s of failed) {
          console.error(`⚠️  Failed to scrape ${s.url}: ${s.error}`);
        }
      }

      const snapshot: ProjectSnapshot = {
        directoryStructure: '',
        files: {},
        sources,
      };

      const output = JSON.stringify(snapshot, null, 2);

      if (flags.output) {
        writeFileSync(flags.output, output + '\n');
        if (!options.silent && !options.json) {
          console.error(`✅ Wrote ${sources.length} source(s) to ${flags.output}`);
        }
        return this.success(output, snapshot);
      }

      if (options.json || options.silent) {
        return this.success(output, snapshot);
      }

      process.stdout.write(output + '\n');
      return this.success(undefined, snapshot);
    } catch (err) {
      return this.error(`Scrape failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): ScrapeFlags {
    const flags: ScrapeFlags = { urls: [] };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--format') {
        const value = args[++i];
        if (value !== 'markdown' && value !== 'html') {
          throw new Error(`Invalid --format '${value}'. Expected 'markdown' or 'html'.`);
        }
        flags.format = value;
      } else if (arg === '--crawl') {
        flags.crawl = true;
      } else if (arg === '--depth') {
        flags.depth = parseInt(args[++i], 10);
      } else if (arg === '--max-pages') {
        flags.maxPages = parseInt(args[++i], 10);
      } else if (arg === '--only-subpaths') {
        flags.onlySubpaths = true;
      } else if (arg === '--dynamic') {
        flags.dynamic = true;
      } else if (arg === '--delay') {
        flags.delay = parseFloat(args[++i]);
      } else if (arg === '--retries') {
        flags.retries = parseInt(args[++i], 10);
      } else if (arg === '--include-raw-html') {
        flags.includeRawHtml = true;
      } else if (arg === '--output' || arg === '-o') {
        flags.output = args[++i];
      } else if (!arg.startsWith('-')) {
        flags.urls.push(arg);
      }
    }

    return flags;
  }
}
