import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FlattenCommand } from './flatten.js';
import type { CommandContext } from '../types/index.js';
import { writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const mockSnapshot = {
  files: {
    'src/main.ts': 'console.log("hello");',
    'src/nested/utils.ts': 'export const a = 1;'
  },
  instruction: 'Build something cool',
  metadata: {
    version: '1.0.0'
  }
};

describe('FlattenCommand', () => {
  let command: FlattenCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new FlattenCommand();
    mockContext = {
      snapshot: mockSnapshot,
      stdin: '',
      stdinIsPipe: false
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('flatten');
    expect(command.definition.description).toBeDefined();
    expect(command.definition.usage).toBeDefined();
  });

  it('should flatten a simple object with default prefix', async () => {
    const result = await command.execute([], {}, mockContext);
    expect(result.success).toBe(true);
    expect(result.output).toContain('snapshot.files["src/main.ts"] = "console.log(\\"hello\\");";');
    expect(result.output).toContain('snapshot.instruction = "Build something cool";');
    expect(result.output).toContain('snapshot.metadata.version = "1.0.0";');
    expect(result.data).toBeInstanceOf(Array);
  });

  it('should use custom prefix when provided', async () => {
    const result = await command.execute(['--prefix', 'myPrefix'], {}, mockContext);
    expect(result.success).toBe(true);
    expect(result.output).toContain('myPrefix.files["src/main.ts"] = "console.log(\\"hello\\");";');
    expect(result.output).toContain('myPrefix.instruction = "Build something cool";');
  });

  it('should handle missing snapshot source', async () => {
    const emptyContext: CommandContext = {
      stdin: '',
      stdinIsPipe: false
    };

    // Silence stderr output for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await command.execute([], {}, emptyContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No snapshot source provided');

    consoleSpy.mockRestore();
  });

  it('should process input from stdin if piped', async () => {
    const pipedContext: CommandContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
    const result = await command.execute([], {}, pipedContext);
    expect(result.success).toBe(true);
    expect(result.output).toContain('snapshot.instruction = "Build something cool";');
  });

  it('should process input from a file', async () => {
    const snapshotPath = 'test-flatten-snap.json';
    writeFileSync(snapshotPath, JSON.stringify(mockSnapshot));

    const nonPipedContext: CommandContext = {
      stdinIsPipe: false
    };

    try {
      const result = await command.execute([snapshotPath], {}, nonPipedContext);
      expect(result.success).toBe(true);
      expect(result.output).toContain('snapshot.instruction = "Build something cool";');
      expect(result.output).toContain('snapshot.files["src/main.ts"] = "console.log(\\"hello\\");";');
    } finally {
      if (existsSync(snapshotPath)) {
        rmSync(snapshotPath);
      }
    }
  });

  it('should handle exceptions during execute', async () => {
      // Mock loadSnapshotFromFile to throw an error
      const fileContext: CommandContext = {
          stdinIsPipe: false
      };

      // We'll pass a file that doesn't exist, which should trigger an error in loadSnapshotFromFile
      // Let's silence the error log to keep test output clean
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await command.execute(['non-existent-file.json'], {}, fileContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Flatten failed');

      consoleSpy.mockRestore();
  });
});
