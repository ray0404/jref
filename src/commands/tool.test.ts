import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { ToolCommand } from './tool.js';
import { registry, registerBuiltinCommands } from '../utils/command.js';
import { parserRegistry } from '../parsers/index.js';
import { existsSync, unlinkSync, readFileSync } from 'fs';

describe('ToolCommand', () => {
  beforeAll(async () => {
    await registerBuiltinCommands();
    if (existsSync('.jref/debug.log')) {
      unlinkSync('.jref/debug.log');
    }
  });

  it('should be registered', () => {
    expect(registry.has('tool')).toBe(true);
  });

  it('should execute a command and output raw result when no parser is found', async () => {
    const cmd = new ToolCommand();
    const result = await cmd.execute(['echo', 'hello'], {}, { stdin: '', stdinIsPipe: false });
    
    expect(result.success).toBe(true);
  });

  it('should use a parser when available', async () => {
    const cmd = new ToolCommand();
    // Use 'ls' as it's built-in
    const result = await cmd.execute(['ls', '-la'], { json: true }, { stdin: '', stdinIsPipe: false });
    
    expect(result.success).toBe(true);
  });

  it('should handle --raw flag', async () => {
    const cmd = new ToolCommand();
    const result = await cmd.execute(['--raw', 'ls', '-la'], {}, { stdin: '', stdinIsPipe: false });
    
    expect(result.success).toBe(true);
  });

  it('should log to debug.log and return JSON error on parser failure', async () => {
    // Register a failing parser
    parserRegistry.register({
      name: 'failer',
      description: 'Always fails',
      parse: () => { throw new Error('Planned failure'); }
    });

    const cmd = new ToolCommand();
    const result = await cmd.execute(['--parser', 'failer', 'echo', 'test'], { json: true }, { stdin: '', stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    
    const logContent = readFileSync('.jref/debug.log', 'utf8');
    expect(logContent).toContain('Planned failure');
  });

  it('should handle requested parser not found', async () => {
    const cmd = new ToolCommand();
    const result = await cmd.execute(['--parser', 'non-existent', 'echo', 'test'], { json: true }, { stdin: '', stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    const logContent = readFileSync('.jref/debug.log', 'utf8');
    expect(logContent).toContain('Parser \\"non-existent\\" not found');
  });
});
