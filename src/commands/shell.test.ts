/**
 * Shell Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShellCommand } from './shell.js';
import * as repl from 'node:repl';
import { existsSync, writeFileSync, rmSync, readFileSync } from 'node:fs';

vi.mock('node:repl', () => ({
  start: vi.fn(),
  Recoverable: class Recoverable extends Error {
    constructor(err: Error) {
      super(err.message);
      this.name = 'Recoverable';
    }
  }
}));

describe('ShellCommand', () => {
  let command: ShellCommand;
  const testSnapshot = 'test-shell-snapshot.json';

  beforeEach(() => {
    command = new ShellCommand();
    if (existsSync(testSnapshot)) {
      rmSync(testSnapshot);
    }
    writeFileSync(testSnapshot, JSON.stringify({
      files: { 'test.ts': 'const x = 1;' },
      directoryStructure: 'test.ts'
    }));
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('shell');
  });

  it('should start a REPL and bind context', async () => {
    const mockReplServer: any = {
      context: {},
      defineCommand: vi.fn(),
      on: vi.fn((event, cb) => {
        if (event === 'exit') {
          setTimeout(cb, 10);
        }
        return mockReplServer;
      }),
    };
    (repl.start as any).mockReturnValue(mockReplServer);

    const executePromise = command.execute([testSnapshot], {}, { stdinIsPipe: false });
    
    await vi.waitFor(() => {
      expect(repl.start).toHaveBeenCalled();
    });

    const startOptions = (repl.start as any).mock.calls[0][0];
    expect(startOptions.prompt).toBe('jref> ');
    expect(startOptions.eval).toBeDefined();

    await executePromise;

    expect(mockReplServer.context.ctx).toBeDefined();
    expect(mockReplServer.context.files).toBeDefined();
    expect(mockReplServer.context.files['test.ts']).toBe('const x = 1;');
    expect(mockReplServer.defineCommand).toHaveBeenCalledWith('save', expect.any(Object));
    expect(mockReplServer.defineCommand).toHaveBeenCalledWith('reload', expect.any(Object));
  });

  it('should handle .save command', async () => {
    let saveAction: any;
    const mockReplServer: any = {
      context: {},
      defineCommand: vi.fn((name, options) => {
        if (name === 'save') saveAction = options.action;
      }),
      on: vi.fn((event, cb) => {
        if (event === 'exit') setTimeout(cb, 50);
        return mockReplServer;
      }),
      displayPrompt: vi.fn(),
    };
    (repl.start as any).mockReturnValue(mockReplServer);

    const executePromise = command.execute([testSnapshot], { silent: true }, { stdinIsPipe: false });
    
    await vi.waitFor(() => expect(saveAction).toBeDefined());

    // Modify context AFTER it's been loaded from disk by the command
    mockReplServer.context.ctx.files['test.ts'] = 'modified';

    // Test save to original file
    saveAction();
    const savedContent = JSON.parse(readFileSync(testSnapshot, 'utf8'));
    expect(savedContent.files['test.ts']).toBe('modified');

    // Test save to new file
    const newFile = 'new-shell-snapshot.json';
    if (existsSync(newFile)) rmSync(newFile);
    saveAction(newFile);
    expect(existsSync(newFile)).toBe(true);
    const newContent = JSON.parse(readFileSync(newFile, 'utf8'));
    expect(newContent.files['test.ts']).toBe('modified');
    rmSync(newFile);

    await executePromise;
  });

  it('should handle .reload command', async () => {
    let reloadAction: any;
    const mockReplServer: any = {
      context: { ctx: {}, files: {} },
      defineCommand: vi.fn((name, options) => {
        if (name === 'reload') reloadAction = options.action;
      }),
      on: vi.fn((event, cb) => {
        if (event === 'exit') setTimeout(cb, 50);
        return mockReplServer;
      }),
      displayPrompt: vi.fn(),
    };
    (repl.start as any).mockReturnValue(mockReplServer);

    const executePromise = command.execute([testSnapshot], { silent: true }, { stdinIsPipe: false });
    
    await vi.waitFor(() => expect(reloadAction).toBeDefined());

    // Modify file on disk
    writeFileSync(testSnapshot, JSON.stringify({
      files: { 'test.ts': 'reloaded' },
      directoryStructure: 'test.ts'
    }));

    await reloadAction();
    expect(mockReplServer.context.ctx.files['test.ts']).toBe('reloaded');
    expect(mockReplServer.context.files['test.ts']).toBe('reloaded');

    await executePromise;
  });

  it('should handle async errors and recoverable errors in custom eval', async () => {
    let evalFunc: any;
    const mockReplServer: any = {
      context: {},
      defineCommand: vi.fn(),
      on: vi.fn((event, cb) => {
        if (event === 'exit') setTimeout(cb, 10);
        return mockReplServer;
      }),
    };
    (repl.start as any).mockImplementation((options: any) => {
      evalFunc = options.eval;
      return mockReplServer;
    });

    await command.execute([testSnapshot], { silent: true }, { stdinIsPipe: false });
    
    const callback = vi.fn();
    
    // Test normal eval
    await evalFunc('1 + 1', mockReplServer.context, 'test.js', callback);
    expect(callback).toHaveBeenCalledWith(null, 2);

    // Test async rejection
    callback.mockClear();
    await evalFunc('Promise.reject(new Error("async fail"))', mockReplServer.context, 'test.js', callback);
    expect(callback.mock.calls[0][0]).toBeNull();
    expect(callback.mock.calls[0][1].message).toBe('async fail');

    // Test recoverable error (multiline)
    callback.mockClear();
    await evalFunc('function test() {', mockReplServer.context, 'test.js', callback);
    expect(callback.mock.calls[0][0].name).toBe('Recoverable');
  });
});
