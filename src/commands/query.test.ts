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