/**
 * Inspect Command Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InspectCommand } from './inspect.js';
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

describe('InspectCommand', () => {
  let command: InspectCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new InspectCommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('inspect');
    expect(command.definition.description).toBeTruthy();
    expect(command.definition.examples.length).toBeGreaterThan(0);
  });

  it('should execute successfully with valid input', async () => {
    const result = await command.execute([], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should parse --metadata flag', async () => {
    const result = await command.execute(['--metadata'], { json: true }, mockContext);

    expect(result.success).toBe(true);
  });

  it('should parse --structure flag', async () => {
    const result = await command.execute(['--structure'], { json: true }, mockContext);

    expect(result.success).toBe(true);
  });

  it('should parse --files flag', async () => {
    const result = await command.execute(['--files'], { json: true }, mockContext);

    expect(result.success).toBe(true);
  });

  it('should handle invalid JSON input', async () => {
    const context: CommandContext = {
      stdin: 'invalid json',
      stdinIsPipe: true
    };

    const result = await command.execute([], {}, context);

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });

  it('should handle empty input', async () => {
    const context: CommandContext = {
      stdin: '',
      stdinIsPipe: true
    };

    const result = await command.execute([], {}, context);

    expect(result.success).toBe(false);
  });

  it('should print help correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    command.printHelp({});

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('INSPECT');

    consoleSpy.mockRestore();
  });

  it('should print help in JSON format', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    command.printHelp({ json: true });

    expect(consoleSpy).toHaveBeenCalled();
    const output = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(output.command).toBe('inspect');

    consoleSpy.mockRestore();
  });
});