/**
 * Scrape Command Tests (scraper API stubbed — no live network)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScrapeCommand } from './scrape.js';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { scrapeSources } from '../api/scrape.js';

vi.mock('../api/scrape.js', async () => {
  const actual = await vi.importActual('../api/scrape.js');
  return {
    ...actual as any,
    scrapeSources: vi.fn(),
  };
});

const cannedSource = {
  url: 'https://example.com/',
  scrapedAt: '2026-11-18T00:00:00.000Z',
  engine: 'pyscraper-md-ts',
  engineVersion: '0.1.0',
  dynamic: false,
  depth: 0,
  parentUrl: null,
  statusCode: null,
  contentHash: 'abc123',
  metadata: { title: 'Example Domain', description: null, author: null, date: null, tags: [] },
  markdown: '# Example Domain\n\nHello world.',
  html: '<h1>Example Domain</h1>',
  navLinks: [],
  internalLinks: [],
  error: null,
};

describe('ScrapeCommand', () => {
  let command: ScrapeCommand;
  const outFile = '/tmp/jref-scrape-test-out.json';

  beforeEach(() => {
    command = new ScrapeCommand();
    vi.mocked(scrapeSources).mockResolvedValue([cannedSource as any]);
    if (existsSync(outFile)) rmSync(outFile);
  });

  afterEach(() => {
    if (existsSync(outFile)) rmSync(outFile);
    vi.clearAllMocks();
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('scrape');
    expect(command.definition.description).toBeTruthy();
    expect(command.definition.examples.length).toBeGreaterThan(0);
  });

  it('should build a snapshot with files:{} and sources:[...]', async () => {
    const result = await command.execute(
      ['https://example.com/'],
      { silent: true, json: true },
      { stdin: '', stdinIsPipe: false }
    );

    expect(result.success).toBe(true);
    const snapshot = result.data as any;
    expect(snapshot.files).toEqual({});
    expect(snapshot.directoryStructure).toBe('');
    expect(snapshot.sources).toHaveLength(1);
    expect(snapshot.sources[0].url).toBe('https://example.com/');
    expect(snapshot.sources[0].metadata.title).toBe('Example Domain');
    expect(vi.mocked(scrapeSources)).toHaveBeenCalledWith(
      ['https://example.com/'],
      expect.objectContaining({ crawl: undefined, depth: undefined, format: 'markdown' })
    );
  });

  it('should forward crawl flags to the scrape API', async () => {
    await command.execute(
      ['https://example.com/', '--crawl', '--depth', '2', '--max-pages', '5', '--only-subpaths', '--dynamic', '--delay', '1', '--include-raw-html'],
      { silent: true, json: true },
      { stdin: '', stdinIsPipe: false }
    );

    expect(vi.mocked(scrapeSources)).toHaveBeenCalledWith(
      ['https://example.com/'],
      expect.objectContaining({
        crawl: true,
        depth: 2,
        maxPages: 5,
        onlySubpaths: true,
        dynamic: true,
        delay: 1,
        includeRawHtml: true,
      })
    );
  });

  it('should write the snapshot to --output instead of stdout', async () => {
    const result = await command.execute(
      ['https://example.com/', '--output', outFile],
      { silent: true, json: true },
      { stdin: '', stdinIsPipe: false }
    );

    expect(result.success).toBe(true);
    expect(existsSync(outFile)).toBe(true);
    const written = JSON.parse(readFileSync(outFile, 'utf8'));
    expect(written.sources).toHaveLength(1);
    expect(written.sources[0].url).toBe('https://example.com/');
  });

  it('should error when no URL is given', async () => {
    const result = await command.execute(
      [],
      { silent: true, json: true },
      { stdin: '', stdinIsPipe: false }
    );

    expect(result.success).toBe(false);
    expect(vi.mocked(scrapeSources)).not.toHaveBeenCalled();
  });

  it('should error on an invalid --format', async () => {
    const result = await command.execute(
      ['https://example.com/', '--format', 'html-document'],
      { silent: true, json: true },
      { stdin: '', stdinIsPipe: false }
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid --format/);
  });
});
