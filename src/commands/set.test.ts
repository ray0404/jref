import { describe, it, expect, beforeEach } from 'vitest';
import { SetCommand } from './set.js';
import type { CommandContext } from '../types/index.js';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': 'console.log("hello");'
  },
  instruction: 'Build something cool'
};

describe('SetCommand', () => {
  let command: SetCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new SetCommand();
    mockContext = {
      snapshot: JSON.parse(JSON.stringify(mockSnapshot)), // Deep clone
      stdin: '',
      stdinIsPipe: false
    };
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('set');
  });

  it('should update a top-level string', async () => {
    const result = await command.execute(['instruction', 'New plan'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.instruction).toBe('New plan');
  });

  it('should update a nested value with brackets', async () => {
    const result = await command.execute(['files["src/main.ts"]', 'console.log("v2");'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.files['src/main.ts']).toBe('console.log("v2");');
  });

  it('should parse numeric values', async () => {
    const result = await command.execute(['version', '1.5'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.version).toBe(1.5);
  });

  it('should parse boolean values', async () => {
    const result = await command.execute(['active', 'true'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.active).toBe(true);
  });

  it('should parse JSON objects', async () => {
    const result = await command.execute(['config', '{"theme": "dark"}'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.config).toEqual({ theme: 'dark' });
  });

  it('should return error if no path provided', async () => {
    const result = await command.execute([], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No path provided');
  });

  it('should return error if no value provided', async () => {
    const result = await command.execute(['path'], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No value provided');
  });
});

describe('SetCommand Extensibility', () => {
  it('should update directoryStructure when a new file is added', async () => {
    const command = new SetCommand();
    const mockContext = {
      snapshot: {
        files: { 'a.js': '' },
        directoryStructure: '.\n└── a.js\n'
      },
      stdin: '',
      stdinIsPipe: false
    };
    const result = await command.execute(['files["b.js"]', 'test'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.directoryStructure).toContain('b.js');
  });

  it('should not throw if we modify something generic and there is no file', async () => {
    const command = new SetCommand();
    const mockContext = {
      snapshot: { name: 'my-project' },
      stdin: '',
      stdinIsPipe: false
    };
    const result = await command.execute(['version', '1.0'], {}, mockContext);
    expect(result.success).toBe(true);
    const updated = JSON.parse(result.output!);
    expect(updated.version).toBe(1.0);
    expect(updated.name).toBe('my-project');
  });
});
