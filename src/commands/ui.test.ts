/**
 * UI Command Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { UICommand } from './ui.js';
import type { CLIOptions, CommandContext } from '../types/index.js';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts\n├── package.json',
  files: {
    'src/main.ts': 'export function main() {}',
    'package.json': '{"name": "test"}'
  },
  instruction: 'Test instruction',
  fileSummary: 'Test summary'
};

describe('UICommand', () => {
  let command: UICommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new UICommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('ui');
    expect(command.definition.description).toBeTruthy();
    expect(command.definition.examples.length).toBeGreaterThan(0);
  });

  it('should show help with --help flag', async () => {
    const result = await command.execute(['--help'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should show help with -h flag', async () => {
    const result = await command.execute(['-h'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should handle invalid JSON input', async () => {
    const context: CommandContext = {
      stdin: 'invalid json',
      stdinIsPipe: true
    };

    const result = await command.execute([], {}, context);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.error).toContain('UI failed');
  });

  it('should handle empty input', async () => {
    const context: CommandContext = {
      stdin: '',
      stdinIsPipe: true
    };

    const result = await command.execute([], {}, context);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });

  it('should print help correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    command.printHelp({});

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('UI COMMAND');

    consoleSpy.mockRestore();
  });

  it('should print help in JSON format', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    command.printHelp({ json: true });

    expect(consoleSpy).toHaveBeenCalled();
    const output = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(output.command).toBe('ui');

    consoleSpy.mockRestore();
  });

  it('should parse args correctly', () => {
    const { flags, filePath } = (command as any).parseArgs(['--help', 'test.json']);
    expect(flags.help).toBe(true);
    expect(filePath).toBe('test.json');
  });
});