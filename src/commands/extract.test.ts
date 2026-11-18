/**
 * Extract Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExtractCommand } from './extract.js';
import type { CommandContext } from '../types/index.js';
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts\n├── package.json',
  files: {
    'src/main.ts': 'export function main() {}',
    'package.json': '{"name": "test"}'
  }
};

describe('ExtractCommand', () => {
  let command: ExtractCommand;
  let mockContext: CommandContext;
  const testOutputDir = './test-extracted';

  beforeEach(() => {
    command = new ExtractCommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('extract');
  });

  it('should extract all files when no patterns provided', async () => {
    const result = await command.execute(['--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(true);
    expect(readFileSync(join(testOutputDir, 'src/main.ts'), 'utf8')).toBe(mockSnapshot.files['src/main.ts']);
  });

  it('should extract matching files with wildcard pattern', async () => {
    const result = await command.execute(['--output', testOutputDir, 'src/*.ts'], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(false);
  });

  it('should pipe decoded content to stdout when --stdout is used', async () => {
    const binarySnapshot = {
      encodings: {
        'data.bin': 'base64'
      },
      files: {
        'data.bin': Buffer.from('binary content').toString('base64')
      }
    };
    const context: CommandContext = {
      stdin: JSON.stringify(binarySnapshot),
      stdinIsPipe: true
    };

    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const result = await command.execute(['--stdout', 'data.bin'], {}, context);

    expect(result.success).toBe(true);
    expect(stdoutSpy).toHaveBeenCalled();
    const pipedData = stdoutSpy.mock.calls[0][0] as Buffer;
    expect(pipedData.toString()).toBe('binary content');
    
    stdoutSpy.mockRestore();
  });

  it('should handle dry-run mode', async () => {
    const result = await command.execute(['--dry-run', '--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(testOutputDir)).toBe(false);
  });

  it('should support piped input patterns', async () => {
    // When stdin is pipe, args are patterns
    const result = await command.execute(['package.json', '--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(false);
  });

  it('should handle non-piped input with file path', async () => {
    // Create a temporary snapshot file
    const snapshotPath = 'test-snap.json';
    writeFileSync(snapshotPath, JSON.stringify(mockSnapshot));

    const nonPipedContext: CommandContext = {
      stdinIsPipe: false
    };

    const result = await command.execute([snapshotPath, 'src/**', '--output', testOutputDir], { json: true }, nonPipedContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    
    rmSync(snapshotPath);
  });
});

const sourcedSnapshot = {
  ...mockSnapshot,
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
      html: '<h1>Example Domain</h1><p>Hello world.</p>',
      navLinks: [],
      internalLinks: [],
      error: null,
    },
  ],
};

describe('ExtractCommand with scraped sources', () => {
  let command: ExtractCommand;
  let sourcedContext: CommandContext;
  const sourcesOutputDir = './test-extracted-sources';

  beforeEach(() => {
    command = new ExtractCommand();
    sourcedContext = {
      stdin: JSON.stringify(sourcedSnapshot),
      stdinIsPipe: true,
    };
    if (existsSync(sourcesOutputDir)) {
      rmSync(sourcesOutputDir, { recursive: true, force: true });
    }
  });

  it('should extract sources to web/<host>/<slug>.md', async () => {
    const result = await command.execute(['--sources', '--output', sourcesOutputDir], { json: true }, sourcedContext);

    expect(result.success).toBe(true);
    const mdPath = join(sourcesOutputDir, 'web/example.com/Example_Domain.md');
    expect(existsSync(mdPath)).toBe(true);
    expect(readFileSync(mdPath, 'utf8')).toContain('Hello world.');
    // Default extract must not change: no snapshot files are written in --sources mode.
    expect(existsSync(join(sourcesOutputDir, 'src/main.ts'))).toBe(false);
  });

  it('should also write .html with --format html', async () => {
    const result = await command.execute(
      ['--sources', '--format', 'html', '--output', sourcesOutputDir],
      { json: true },
      sourcedContext
    );

    expect(result.success).toBe(true);
    expect(existsSync(join(sourcesOutputDir, 'web/example.com/Example_Domain.md'))).toBe(true);
    const htmlPath = join(sourcesOutputDir, 'web/example.com/Example_Domain.html');
    expect(existsSync(htmlPath)).toBe(true);
    expect(readFileSync(htmlPath, 'utf8')).toContain('<h1>Example Domain</h1>');
  });

  it('should error when the snapshot has no sources', async () => {
    const plainContext: CommandContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true,
    };
    const result = await command.execute(['--sources', '--output', sourcesOutputDir], { json: true }, plainContext);

    expect(result.success).toBe(false);
  });
});
