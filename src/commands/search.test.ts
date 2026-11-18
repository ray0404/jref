/**
 * Search Command Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchCommand } from './search.js';
import type { CLIOptions, CommandContext } from '../types/index.js';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': `export function main() {
  console.log('Hello');
  // TODO: add more
}`,
    'src/utils.ts': `export function helper() {
  return 'help';
}`,
    'README.md': `# Project README
This is a test project.`
  }
};

describe('SearchCommand', () => {
  let command: SearchCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new SearchCommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('search');
    expect(command.definition.description).toBeTruthy();
  });

  it('should find keyword matches', async () => {
    const result = await command.execute(['function'], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should find regex matches', async () => {
    const result = await command.execute(
      ['export.*main', '--regex'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
  });

  it('should perform case-insensitive search', async () => {
    const result = await command.execute(
      ['TODO'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
  });

  it('should require pattern', async () => {
    const result = await command.execute([], {}, mockContext);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });

  it('should handle invalid JSON', async () => {
    const context: CommandContext = {
      stdin: 'invalid',
      stdinIsPipe: true
    };

    const result = await command.execute(['test'], {}, context);

    expect(result.success).toBe(false);
  });

  it('should parse --max-results flag', async () => {
    const result = await command.execute(
      ['function', '--max-results', '5'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
  });

  it('should parse --context flag', async () => {
    const result = await command.execute(
      ['function', '--context', '2'],
      { json: true },
      mockContext
    );

    expect(result.success).toBe(true);
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

describe('SearchCommand with scraped sources', () => {
  let command: SearchCommand;
  let sourcedContext: CommandContext;

  beforeEach(() => {
    command = new SearchCommand();
    sourcedContext = {
      stdin: JSON.stringify(sourcedSnapshot),
      stdinIsPipe: true,
    };
  });

  it('should not search sources by default', async () => {
    const result = await command.execute(['Hello world'], { json: true }, sourcedContext);

    expect(result.success).toBe(true);
    const results = (result.data as any).results as Array<{ filePath: string }>;
    expect(results.some((r) => r.filePath.startsWith('source:'))).toBe(false);
  });

  it('should search source markdown with --sources', async () => {
    const result = await command.execute(['Hello world', '--sources'], { json: true }, sourcedContext);

    expect(result.success).toBe(true);
    const results = (result.data as any).results as Array<{ filePath: string }>;
    expect(results.some((r) => r.filePath === 'source:https://example.com/')).toBe(true);
  });

  it('should only search source HTML with --include-html', async () => {
    // 'Example Domain</h1>' only appears in the stored HTML, not the Markdown
    // (the Markdown has '# Example Domain' as a heading line instead).
    const withoutHtml = await command.execute(['</h1>', '--sources'], { json: true }, sourcedContext);
    const withHtml = await command.execute(['</h1>', '--sources', '--include-html'], { json: true }, sourcedContext);

    const hasSource = (r: any) => (r.data.results as Array<{ filePath: string }>).some((x) => x.filePath.startsWith('source:'));
    expect(hasSource(withoutHtml)).toBe(false);
    expect(hasSource(withHtml)).toBe(true);
  });
});
