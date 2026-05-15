/**
 * Run Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RunCommand } from './run.js';
import { existsSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as child_process from 'node:child_process';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    on: vi.fn((event, cb) => {
      if (event === 'close') cb(0);
      return this;
    }),
  })),
}));

describe('RunCommand', () => {
  let command: RunCommand;
  const testSnapshot = 'test-run-snapshot.json';

  beforeEach(() => {
    command = new RunCommand();
    if (existsSync(testSnapshot)) {
      rmSync(testSnapshot);
    }
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('run');
  });

  it('should rewrite shebangs in Termux environment', async () => {
    // Mock Termux environment
    process.env.PREFIX = '/data/data/com.termux/files/usr';
    
    const scriptContent = '#!/bin/bash\necho "Hello"';
    writeFileSync(testSnapshot, JSON.stringify({
      files: { 'test.sh': scriptContent },
      directoryStructure: 'test.sh'
    }));

    const mockSpawn = vi.spyOn(child_process, 'spawn').mockReturnValue({
      on: vi.fn((event, cb) => {
        if (event === 'close') cb(0);
      }),
    } as any);

    await command.execute(['--path', 'test.sh', testSnapshot], { silent: true }, { stdinIsPipe: false });

    // The command should be rewritten to Termux path
    expect(mockSpawn).toHaveBeenCalledWith(
      '/data/data/com.termux/files/usr/bin/bash',
      expect.arrayContaining([expect.stringContaining('test.sh')]),
      expect.any(Object)
    );

    // Clean up
    delete process.env.PREFIX;
    rmSync(testSnapshot);
  });

  it('should handle /usr/bin/env shebangs in Termux', async () => {
    process.env.PREFIX = '/data/data/com.termux/files/usr';
    
    const scriptContent = '#!/usr/bin/env node\nconsole.log("Hello")';
    writeFileSync(testSnapshot, JSON.stringify({
      files: { 'test.js': scriptContent },
      directoryStructure: 'test.js'
    }));

    const mockSpawn = vi.spyOn(child_process, 'spawn').mockReturnValue({
      on: vi.fn((event, cb) => {
        if (event === 'close') cb(0);
      }),
    } as any);

    await command.execute(['--path', 'test.js', testSnapshot], { silent: true }, { stdinIsPipe: false });

    expect(mockSpawn).toHaveBeenCalledWith(
      '/data/data/com.termux/files/usr/bin/node',
      expect.arrayContaining([expect.stringContaining('test.js')]),
      expect.any(Object)
    );

    delete process.env.PREFIX;
    rmSync(testSnapshot);
  });
});
