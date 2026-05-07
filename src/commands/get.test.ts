import { describe, it, expect, beforeEach } from 'vitest';
import { GetCommand } from './get.js';
import type { CommandContext } from '../types/index.js';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': 'console.log("hello");'
  },
  instruction: 'Build something cool'
};

describe('GetCommand', () => {
  let command: GetCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new GetCommand();
    mockContext = {
      snapshot: mockSnapshot,
      stdin: '',
      stdinIsPipe: false
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('get');
  });

  it('should retrieve a simple top-level value', async () => {
    const result = await command.execute(['instruction'], {}, mockContext);
    expect(result.success).toBe(true);
    expect(result.output).toBe('Build something cool');
  });

  it('should retrieve a nested value in files', async () => {
    const result = await command.execute(['files["src/main.ts"]'], {}, mockContext);
    expect(result.success).toBe(true);
    expect(result.output).toBe('console.log("hello");');
  });

  it('should handle raw flag for strings', async () => {
    const result = await command.execute(['instruction'], { raw: true }, mockContext);
    expect(result.success).toBe(true);
    expect(result.output).toBe('Build something cool');
  });

  it('should format objects as JSON', async () => {
    const result = await command.execute(['files'], {}, mockContext);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output!);
    expect(parsed).toEqual(mockSnapshot.files);
  });

  it('should return error if path not found', async () => {
    const result = await command.execute(['nonexistent'], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Path not found');
  });

  it('should return error if no path provided', async () => {
    const result = await command.execute([], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No path provided');
  });
});
