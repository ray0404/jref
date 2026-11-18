/**
 * @module API/Scrape
 * Programmatic interface for scraping web pages into jref snapshots.
 *
 * Library-first integration with `@ray0404/pyscraper-md-ts`: the scraper
 * is imported in-process (no subprocess/CLI bridge). If the package is
 * not installed, every function here throws a helpful error naming the
 * install command instead of a bare module-resolution error.
 *
 * Storage rules (see `ScrapedSource` in `src/types/index.ts`):
 * - Both `markdown` and `html` are always stored; they come from the
 *   same fetch, so there is no extra cost. The `format` option only
 *   selects which representation `query --source-url` returns by
 *   default — it does not change what is stored.
 * - `html_document` is never stored: it is regenerable from
 *   `html` + `metadata` + `url` via the scraper's `wrapHtmlDocument`.
 * - `rawHtml` is opt-in (`includeRawHtml`) because it roughly doubles
 *   the stored size.
 * - The scraper reports no HTTP status code, so `statusCode` is
 *   recorded as `null` (honest unknown) — a stored page was fetched
 *   successfully, because the scraper throws on non-OK responses, but
 *   the exact code is not invented.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ScrapeResult } from '@ray0404/pyscraper-md-ts';
import type { ScrapedSource } from '../types/index.js';

type SelectOutput = (
  result: Partial<ScrapeResult>,
  format: string
) => [string, string];

/**
 * Output format for scraped content. Both representations are always
 * stored in the snapshot; this selects the default representation
 * returned by `query --source-url` (and the preview shown by
 * `jref scrape` in human mode).
 */
export type ScrapeFormat = 'markdown' | 'html';

/**
 * Configuration options for `scrapeSources`.
 */
export interface ScrapeSourcesOptions {
  /**
   * Default representation for readers (`query --source-url`).
   * Default: 'markdown'.
   */
  format?: ScrapeFormat;
  /**
   * Crawl from the seed URLs following same-domain links.
   * Default: false.
   */
  crawl?: boolean;
  /**
   * Maximum crawl depth (0 = seed URLs only). Default: 2.
   */
  depth?: number;
  /**
   * Maximum number of pages to fetch in a crawl. Default: 10.
   */
  maxPages?: number;
  /**
   * Only follow links under the seed URL subpaths. Default: false.
   */
  onlySubpaths?: boolean;
  /**
   * Render pages with a headless browser (Playwright). Requires the
   * `playwright` package and a Chromium install (or `CHROMIUM_PATH`).
   * Default: false.
   */
  dynamic?: boolean;
  /**
   * Delay in seconds before each fetch (politeness). Default: 0 for
   * direct `scrapeSources` calls; `jref pack --scrape` passes 1.
   */
  delay?: number;
  /**
   * Number of retries on network/5xx failures. Default: 3 (the
   * scraper's default).
   */
  retries?: number;
  /**
   * Request timeout in seconds. Default: 30 (the scraper's default).
   */
  timeout?: number;
  /**
   * Store the full raw HTML alongside the cleaned content.
   * Default: false.
   */
  includeRawHtml?: boolean;
  /**
   * Injectable fetch implementation (used by tests to avoid live
   * network access). Passed straight through to the scraper.
   */
  fetchImpl?: typeof fetch;
}

const SCRAPER_PACKAGE = '@ray0404/pyscraper-md-ts';
const SCRAPER_INSTALL_HINT =
  `Web scraping requires '${SCRAPER_PACKAGE}'. Install it with: npm install ${SCRAPER_PACKAGE}`;

/**
 * Version of the installed scraper package, or 'unknown' when it
 * cannot be determined. The package's `exports` map does not expose
 * `./package.json`, so the version is read by resolving the entry
 * point and walking up to the package root instead.
 */
export function scraperVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    let dir = dirname(require.resolve(SCRAPER_PACKAGE));
    for (let i = 0; i < 5; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
          name?: string;
          version?: string;
        };
        if (pkg.name === SCRAPER_PACKAGE) return pkg.version ?? 'unknown';
      } catch {
        // Not this directory — keep walking up.
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
    // Fall through to 'unknown'.
  }
  return 'unknown';
}

async function loadScraper(): Promise<typeof import('@ray0404/pyscraper-md-ts')> {
  try {
    return await import('@ray0404/pyscraper-md-ts');
  } catch {
    throw new Error(SCRAPER_INSTALL_HINT);
  }
}

function sha256Hex(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function toScrapedSource(
  result: ScrapeResult,
  opts: {
    selectOutput: SelectOutput;
    engineVersion: string;
    dynamic: boolean;
    depth: number;
    parentUrl: string | null;
    includeRawHtml: boolean;
  }
): ScrapedSource {
  // selectOutput is the scraper's own format picker: 'markdown' yields
  // the Markdown text, 'html' yields the cleaned content HTML.
  const [markdown] = opts.selectOutput(result, 'markdown');
  const [html] = opts.selectOutput(result, 'html');
  return {
    url: result.url,
    scrapedAt: new Date().toISOString(),
    engine: 'pyscraper-md-ts',
    engineVersion: opts.engineVersion,
    dynamic: opts.dynamic,
    depth: opts.depth,
    parentUrl: opts.parentUrl,
    // The scraper throws on non-OK responses, so a stored page was
    // fetched successfully — but it reports no status code, so we
    // record null rather than inventing a 200.
    statusCode: null,
    contentHash: sha256Hex(markdown),
    metadata: {
      title: result.metadata.title,
      description: result.metadata.description,
      author: result.metadata.author,
      date: result.metadata.date,
      tags: result.metadata.tags,
    },
    markdown,
    html,
    rawHtml: opts.includeRawHtml ? result.raw_html : undefined,
    navLinks: result.nav_links,
    internalLinks: result.internal_links,
    error: null,
  };
}

function failedSource(
  url: string,
  depth: number,
  parentUrl: string | null,
  engineVersion: string,
  dynamic: boolean,
  err: unknown
): ScrapedSource {
  return {
    url,
    scrapedAt: new Date().toISOString(),
    engine: 'pyscraper-md-ts',
    engineVersion,
    dynamic,
    depth,
    parentUrl,
    statusCode: null,
    contentHash: sha256Hex(''),
    metadata: { title: null, description: null, author: null, date: null, tags: [] },
    markdown: '',
    html: '',
    rawHtml: undefined,
    navLinks: [],
    internalLinks: [],
    error: err instanceof Error ? err.message : String(err),
  };
}

/**
 * Scrape one or more URLs (optionally crawling from them) and return
 * one `ScrapedSource` per page, in crawl (BFS) order.
 *
 * In crawl mode a single failed page does NOT abort the crawl: it is
 * recorded with empty `markdown`/`html` and `error` set. In
 * non-crawl mode (including a single URL) any fetch failure throws.
 *
 * @param urls - Seed URLs to scrape. Must contain at least one URL.
 * @param options - Scrape/crawl options.
 * @returns The scraped sources.
 * @throws Error if no URLs are given, or (outside crawl mode) if any
 *   fetch fails, or if `@ray0404/pyscraper-md-ts` is not installed.
 */
export async function scrapeSources(
  urls: string[],
  options: ScrapeSourcesOptions = {}
): Promise<ScrapedSource[]> {
  if (urls.length === 0) {
    throw new Error('scrapeSources requires at least one URL');
  }

  const {
    crawl = false,
    depth = 2,
    maxPages = 10,
    onlySubpaths = false,
    dynamic = false,
    delay = 0,
    retries = 3,
    timeout = 30,
    includeRawHtml = false,
    fetchImpl,
  } = options;

  const scraper = await loadScraper();
  const engineVersion = scraperVersion();
  const callOptions = { dynamic, delay, retries, timeout, fetchImpl };

  if (!crawl) {
    const sources: ScrapedSource[] = [];
    for (const url of urls) {
      const result = await scraper.scrapeNative(url, callOptions);
      sources.push(
        toScrapedSource(result, {
          selectOutput: scraper.selectOutput,
          engineVersion,
          dynamic,
          depth: 0,
          parentUrl: null,
          includeRawHtml,
        })
      );
    }
    return sources;
  }

  // Crawl mode: drive the scraper's Crawler + a single shared Scraper
  // directly so per-page depth and parent URL are known (crawlNative
  // returns bare results with no depth/parent tracking).
  const crawler = new scraper.Crawler(urls, {
    maxDepth: depth,
    maxPages,
    onlySubpaths,
  });
  const shared = new scraper.Scraper(callOptions);
  const sources: ScrapedSource[] = [];
  const parentByUrl = new Map<string, string | null>();
  for (const url of urls) parentByUrl.set(url, null);

  try {
    while (crawler.hasNext()) {
      const item = crawler.next();
      if (!item) break;
      try {
        const result = await shared.scrape(item.url, callOptions);
        // Record the first discoverer as parent for newly seen links
        // (BFS order, mirroring the crawler's own visited set).
        for (const link of result.internal_links) {
          if (!parentByUrl.has(link)) parentByUrl.set(link, item.url);
        }
        sources.push(
          toScrapedSource(result, {
            selectOutput: scraper.selectOutput,
            engineVersion,
            dynamic,
            depth: item.depth,
            parentUrl: parentByUrl.get(item.url) ?? null,
            includeRawHtml,
          })
        );
        crawler.addLinks(result.internal_links, item.depth);
      } catch (err) {
        // One failed page must not abort the whole crawl.
        sources.push(
          failedSource(item.url, item.depth, parentByUrl.get(item.url) ?? null, engineVersion, dynamic, err)
        );
      }
    }
    return sources;
  } finally {
    await shared.close();
  }
}

/**
 * Scrape a single URL and return its `ScrapedSource`.
 * Convenience wrapper around `scrapeSources`; throws on failure.
 */
export async function scrapeUrl(
  url: string,
  options: ScrapeSourcesOptions = {}
): Promise<ScrapedSource> {
  const [source] = await scrapeSources([url], { ...options, crawl: false });
  return source;
}
