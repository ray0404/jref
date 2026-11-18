/**
 * Query Command Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCommand } from './query.js';
import type { CLIOptions, CommandContext } from '../types/index.js';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': `export function main() {
  console.log('Hello');
}`,
    'src/utils.ts': `export function helper() {
  return 'help';
}`
  }
};

describe('QueryCommand', () => {
  let command: QueryCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new QueryCommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('query');
    expect(command.definition.description).toBeTruthy();
  });

  it('should retrieve file content', async () => {
    const result = await command.execute(
      ['--path', 'src/main.ts'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should require --path option', async () => {
    const result = await command.execute([], {}, mockContext);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });

  it('should return error for non-existent file', async () => {
    const result = await command.execute(
      ['--path', 'nonexistent.ts'],
      {},
      mockContext
    );

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(2);
  });

  it('should support --raw flag', async () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const result = await command.execute(
      ['--path', 'src/main.ts', '--raw'],
      {},
      mockContext
    );

    expect(result.success).toBe(true);
    expect(stdoutSpy).toHaveBeenCalled();

    stdoutSpy.mockRestore();
  });

  it('should support line range options', async () => {
    const result = await command.execute(
      ['--path', 'src/main.ts', '--line-start', '1', '--line-end', '2'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
  });

  it('should handle invalid JSON input', async () => {
    const context: CommandContext = {
      stdin: 'invalid',
      stdinIsPipe: true
    };

    const result = await command.execute(['--path', 'test.ts'], {}, context);

    expect(result.success).toBe(false);
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

describe('QueryCommand with scraped sources', () => {
  let command: QueryCommand;
  let sourcedContext: CommandContext;

  beforeEach(() => {
    command = new QueryCommand();
    sourcedContext = {
      stdin: JSON.stringify(sourcedSnapshot),
      stdinIsPipe: true,
    };
  });

  it('should return a source markdown by --source-url', async () => {
    const result = await command.execute(
      ['--source-url', 'https://example.com/', '--raw'],
      { json: true },
      sourcedContext
    );

    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.url).toBe('https://example.com/');
    expect(data.format).toBe('markdown');
    expect(data.content).toContain('Hello world.');
  });

  it('should return source HTML with --format html', async () => {
    const result = await command.execute(
      ['--source-url', 'https://example.com/', '--format', 'html', '--raw'],
      { json: true },
      sourcedContext
    );

    expect(result.success).toBe(true);
    expect((result.data as any).format).toBe('html');
    expect((result.data as any).content).toContain('<h1>Example Domain</h1>');
  });

  it('should error for an unknown source URL', async () => {
    const result = await command.execute(
      ['--source-url', 'https://missing.example/'],
      { json: true },
      sourcedContext
    );

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(2);
  });

  it('should error when --path and --source-url are combined', async () => {
    const result = await command.execute(
      ['--path', 'src/main.ts', '--source-url', 'https://example.com/'],
      { json: true },
      sourcedContext
    );

    expect(result.success).toBe(false);
  });
});
