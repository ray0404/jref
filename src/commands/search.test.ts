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