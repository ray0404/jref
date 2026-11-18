/**
 * Streaming JSON Parser Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseJSON,
  loadSnapshot,
  calculateMetadata,
  validateSnapshot,
  getFilePaths,
  extractFiles,
  processSnapshot
} from './streaming-json.js';
import type { ProjectSnapshot } from '../types/index.js';
import { Readable } from 'stream';

const validSnapshot: ProjectSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': 'export function main() {}',
    'src/utils.ts': 'export function util() {}'
  },
  instruction: 'Test instruction'
};

describe('processSnapshot', () => {
  it('should stream metadata and files', async () => {
    const json = JSON.stringify(validSnapshot);
    const metadata: Record<string, any> = {};
    const files: Record<string, string> = {};

    await processSnapshot(json, {
      onMetadata: (key, value) => {
        metadata[key] = value;
      },
      onFile: (path, content) => {
        files[path] = content;
      }
    });

    expect(metadata.directoryStructure).toBe(validSnapshot.directoryStructure);
    expect(metadata.instruction).toBe(validSnapshot.instruction);
    expect(files).toEqual(validSnapshot.files);
  });

  it('should handle Readable stream input', async () => {
    const json = JSON.stringify(validSnapshot);
    const stream = Readable.from([json]);
    const files: Record<string, string> = {};

    await processSnapshot(stream, {
      onFile: (path, content) => {
        files[path] = content;
      }
    });

    expect(files).toEqual(validSnapshot.files);
  });
});

describe('parseJSON', () => {
  it('should parse valid JSON snapshot', async () => {
    const json = JSON.stringify(validSnapshot);
    const result = await parseJSON(json);

    expect(result).toEqual(validSnapshot);
    expect(result.directoryStructure).toBe(validSnapshot.directoryStructure);
    expect(Object.keys(result.files)).toHaveLength(2);
  });

  it('should throw error for invalid JSON', async () => {
    const invalidJson = '{ invalid json }';

    await expect(parseJSON(invalidJson)).rejects.toThrow();
  });

  it('should handle empty instruction', async () => {
    const snapshot = { ...validSnapshot, instruction: undefined };
    const json = JSON.stringify(snapshot);
    const result = await parseJSON(json);

    expect(result.instruction).toBeUndefined();
  });

  it('should coerce missing directoryStructure from files', async () => {
    const snapshot = {
      files: {
        'src/a.ts': 'content a',
        'src/b.ts': 'content b'
      }
    };
    const json = JSON.stringify(snapshot);
    const result = await parseJSON(json);

    expect(result.directoryStructure).toContain('src/');
    expect(result.directoryStructure).toContain('a.ts');
    expect(result.directoryStructure).toContain('b.ts');
  });
});

describe('calculateMetadata', () => {
  it('should calculate correct metadata', () => {
    const metadata = calculateMetadata(validSnapshot);

    expect(metadata.fileCount).toBe(2);
    expect(metadata.totalSize).toBeGreaterThan(0);
    expect(metadata.hasInstruction).toBe(true);
    expect(metadata.hasFileSummary).toBe(false);
    expect(metadata.hasUserProvidedHeader).toBe(false);
    expect(metadata.directoryStructureLines).toBe(3);
  });

  it('should detect optional fields', () => {
    const snapshot: ProjectSnapshot = {
      directoryStructure: 'test',
      files: { 'test.ts': 'content' },
      instruction: 'inst',
      fileSummary: 'summary',
      userProvidedHeader: 'header'
    };

    const metadata = calculateMetadata(snapshot);

    expect(metadata.hasInstruction).toBe(true);
    expect(metadata.hasFileSummary).toBe(true);
    expect(metadata.hasUserProvidedHeader).toBe(true);
  });
});

describe('validateSnapshot', () => {
  it('should validate correct snapshot', () => {
    expect(validateSnapshot(validSnapshot)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateSnapshot(null)).toBe(false);
  });

  it('should reject primitive', () => {
    expect(validateSnapshot('string')).toBe(false);
    expect(validateSnapshot(123)).toBe(false);
  });

  it('should accept missing directoryStructure (will be coerced)', () => {
    expect(validateSnapshot({ files: {} })).toBe(true);
  });

  it('should reject missing files field', () => {
    expect(validateSnapshot({ directoryStructure: 'test' })).toBe(false);
  });
});

describe('getFilePaths', () => {
  it('should return all file paths', () => {
    const paths = getFilePaths(validSnapshot);

    expect(paths).toHaveLength(2);
    expect(paths).toContain('src/main.ts');
    expect(paths).toContain('src/utils.ts');
  });

  it('should filter by prefix', () => {
    const paths = getFilePaths(validSnapshot, 'src/');

    expect(paths).toHaveLength(2);
  });

  it('should return empty for non-matching prefix', () => {
    const paths = getFilePaths(validSnapshot, 'nonexistent/');

    expect(paths).toHaveLength(0);
  });
});

describe('extractFiles', () => {
  it('should extract specific files', () => {
    const result = extractFiles(validSnapshot, ['src/main.ts']);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['src/main.ts']).toBe(validSnapshot.files['src/main.ts']);
  });

  it('should return empty object for non-existent paths', () => {
    const result = extractFiles(validSnapshot, ['nonexistent.ts']);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should extract multiple files', () => {
    const result = extractFiles(validSnapshot, ['src/main.ts', 'src/utils.ts']);

    expect(Object.keys(result)).toHaveLength(2);
  });
});
const sourcedSnapshot: ProjectSnapshot = {
  ...validSnapshot,
  sources: [
    {
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
    },
  ],
};

describe('scraped sources', () => {
  it('should preserve sources through parseJSON (small snapshot path)', async () => {
    const result = await parseJSON(JSON.stringify(sourcedSnapshot));

    expect(result.sources).toHaveLength(1);
    expect(result.sources![0].url).toBe('https://example.com/');
    expect(result.sources![0].metadata?.title).toBe('Example Domain');
  });

  it('should preserve sources through processSnapshot on a stream (token path)', async () => {
    const stream = Readable.from([JSON.stringify(sourcedSnapshot)]);
    let sources: any;
    const files: Record<string, string> = {};

    await processSnapshot(stream, {
      onMetadata: (key, value) => {
        if (key === 'sources') sources = value;
      },
      onFile: (path, content) => {
        files[path] = content;
      },
    });

    expect(files).toEqual(sourcedSnapshot.files);
    expect(sources).toHaveLength(1);
    expect(sources[0].url).toBe('https://example.com/');
    expect(sources[0].markdown).toContain('Hello world.');
    expect(sources[0].metadata.title).toBe('Example Domain');
    expect(sources[0].metadata.tags).toEqual([]);
  });

  it('should preserve sources through parseJSON on a large (streaming) input', async () => {
    // Pad the snapshot past the 8MB streaming threshold with a large file.
    const big = { ...sourcedSnapshot, files: { ...sourcedSnapshot.files, 'big.txt': 'x'.repeat(9 * 1024 * 1024) } };
    const result = await parseJSON(JSON.stringify(big));

    expect(result.sources).toHaveLength(1);
    expect(result.sources![0].url).toBe('https://example.com/');
  });

  it('should report source counts in calculateMetadata', () => {
    const metadata = calculateMetadata(sourcedSnapshot);

    expect(metadata.sourceCount).toBe(1);
    expect(metadata.hasSources).toBe(true);
    expect(metadata.totalSourceSize).toBeGreaterThan(0);
    expect(metadata.totalSourceSize).toBe(
      Buffer.byteLength('# Example Domain\n\nHello world.', 'utf8') +
        Buffer.byteLength('<h1>Example Domain</h1>', 'utf8')
    );
  });

  it('should report zero sources for snapshots without them', () => {
    const metadata = calculateMetadata(validSnapshot);

    expect(metadata.sourceCount).toBe(0);
    expect(metadata.hasSources).toBe(false);
    expect(metadata.totalSourceSize).toBe(0);
  });

  it('should validate snapshots with sources', () => {
    expect(validateSnapshot(sourcedSnapshot)).toBe(true);
    expect(validateSnapshot({ ...sourcedSnapshot, sources: [{ url: 'https://x/' }] })).toBe(false);
  });
});
