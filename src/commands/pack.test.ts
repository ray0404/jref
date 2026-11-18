/**
 * Pack Command Caching Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PackCommand } from './pack.js';
import { existsSync, writeFileSync, rmSync, mkdirSync, readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import * as repomix from 'repomix';
import { scrapeSources } from '../api/scrape.js';

vi.mock('../api/scrape.js', async () => {
  const actual = await vi.importActual('../api/scrape.js');
  return {
    ...actual as any,
    scrapeSources: vi.fn(),
  };
});

vi.mock('repomix', async () => {
  const actual = await vi.importActual('repomix');
  return {
    ...actual as any,
    runRemoteAction: vi.fn(),
    pack: vi.fn(),
  };
});

// Mocking git ls-remote to simulate remote head check
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual('node:child_process');
  return {
    ...actual as any,
    execSync: vi.fn((command) => {
      if (command.includes('git ls-remote')) {
        return 'mock-sha1 HEAD';
      }
      return '';
    }),
  };
});

describe('PackCommand Caching', () => {
  let command: PackCommand;
  const cacheDir = join(homedir(), '.jref', 'cache');

  beforeEach(() => {
    command = new PackCommand();
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
  });

  it('should cache remote repositories and reuse them', async () => {
    const remoteUrl = 'https://github.com/user/repo';
    const mockSnapshot = {
      directoryStructure: 'test.ts',
      files: { 'test.ts': 'console.log("cached")' },
      instruction: 'Analyze this.'
    };

    // First call: Network hit
    const mockRunRemoteAction = vi.spyOn(repomix, 'runRemoteAction').mockResolvedValue({
      packResult: {
        processedFiles: [{ path: 'test.ts', content: 'console.log("cached")' }]
      }
    } as any);

    await command.execute([remoteUrl], { silent: true }, { stdinIsPipe: false });
    
    expect(mockRunRemoteAction).toHaveBeenCalledTimes(1);
    
    // Verify cache exists
    expect(existsSync(cacheDir)).toBe(true);

    // Second call: Cache hit (mock git ls-remote returns same hash)
    mockRunRemoteAction.mockClear();
    
    await command.execute([remoteUrl], { silent: true }, { stdinIsPipe: false });
    
    // Should NOT call runRemoteAction again because hashes match
    expect(mockRunRemoteAction).toHaveBeenCalledTimes(0);
  });

  it('should pack a local directory with valid repomix filePathStyle configuration', async () => {
    const mockPack = vi.spyOn(repomix, 'pack').mockResolvedValue({
      processedFiles: [{ path: 'src/index.ts', content: 'export const x = 1;' }]
    } as any);

    const res = await command.execute(['.'], { silent: true, json: true }, { stdinIsPipe: false });

    expect(res.success).toBe(true);
    expect(mockPack).toHaveBeenCalledTimes(1);
    const passedConfig = mockPack.mock.calls[0][1] as any;
    expect(passedConfig.output.filePathStyle).toBe('target-relative');
    expect(passedConfig.output.style).toBe('json');
    expect(res.data?.files['src/index.ts']).toBe('export const x = 1;');
  });
});

const cannedScrapedSource = {
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

describe('PackCommand --scrape', () => {
  let command: PackCommand;
  let tmpDir: string;

  beforeEach(() => {
    command = new PackCommand();
    tmpDir = mkdtempSync(join(tmpdir(), 'jref-scrape-'));
    vi.mocked(scrapeSources).mockResolvedValue([cannedScrapedSource as any]);
    vi.spyOn(repomix, 'pack').mockResolvedValue({
      processedFiles: [{ path: 'src/index.ts', content: 'export const x = 1;' }]
    } as any);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should merge scraped sources into the snapshot', async () => {
    const res = await command.execute(
      ['.', '--scrape', 'https://example.com/'],
      { silent: true, json: true },
      { stdinIsPipe: false }
    );

    expect(res.success).toBe(true);
    expect(res.data?.files['src/index.ts']).toBe('export const x = 1;');
    expect(res.data?.sources).toHaveLength(1);
    expect(res.data?.sources![0].url).toBe('https://example.com/');
    expect(vi.mocked(scrapeSources)).toHaveBeenCalledWith(
      ['https://example.com/'],
      expect.objectContaining({ delay: 1, format: 'markdown' })
    );
  });

  it('should forward crawl flags to the scrape API', async () => {
    await command.execute(
      ['.', '--scrape', 'https://example.com/', '--scrape-crawl', '--scrape-depth', '3', '--scrape-max-pages', '5', '--scrape-delay', '2', '--include-raw-html'],
      { silent: true, json: true },
      { stdinIsPipe: false }
    );

    expect(vi.mocked(scrapeSources)).toHaveBeenCalledWith(
      ['https://example.com/'],
      expect.objectContaining({
        crawl: true,
        depth: 3,
        maxPages: 5,
        delay: 2,
        includeRawHtml: true,
      })
    );
  });

  it('should read URLs from --scrape-file (skipping comments and blanks)', async () => {
    const urlsFile = join(tmpDir, 'urls.txt');
    writeFileSync(urlsFile, '# docs\nhttps://example.com/\n\nhttps://example.com/about\n');

    const res = await command.execute(
      ['.', '--scrape-file', urlsFile],
      { silent: true, json: true },
      { stdinIsPipe: false }
    );

    expect(res.success).toBe(true);
    expect(vi.mocked(scrapeSources)).toHaveBeenCalledWith(
      ['https://example.com/', 'https://example.com/about'],
      expect.anything()
    );
  });

  it('should skip scraping entirely when no --scrape flags are given', async () => {
    const res = await command.execute(
      ['.'],
      { silent: true, json: true },
      { stdinIsPipe: false }
    );

    expect(res.success).toBe(true);
    expect(vi.mocked(scrapeSources)).not.toHaveBeenCalled();
    expect(res.data?.sources).toBeUndefined();
  });

  it('should reject --scrape with a non-JSON output style', async () => {
    const res = await command.execute(
      ['.', '--scrape', 'https://example.com/', '--output-style', 'markdown'],
      { silent: true, json: true },
      { stdinIsPipe: false }
    );

    expect(res.success).toBe(false);
    expect(vi.mocked(scrapeSources)).not.toHaveBeenCalled();
  });
});
