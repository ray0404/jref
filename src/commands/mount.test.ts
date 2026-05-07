import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MountCommand } from './mount.js';
import { v2 as webdav } from 'webdav-server';
import fs from 'fs';
import { CommandContext, CLIOptions } from '../types/index.js';

// Mock webdav-server
vi.mock('webdav-server', async () => {
  const actual = await vi.importActual('webdav-server') as any;
  return {
    ...actual,
    v2: {
      ...actual.v2,
      WebDAVServer: vi.fn().mockImplementation(() => ({
        setFileSystem: vi.fn((path, fs, cb) => cb(true)),
        start: vi.fn((cb) => cb()),
        stop: vi.fn((cb) => cb())
      }))
    }
  };
});

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs') as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      writeFileSync: vi.fn()
    }
  };
});

describe('MountCommand', () => {
  let command: MountCommand;
  let context: CommandContext;
  let options: CLIOptions;

  beforeEach(() => {
    command = new MountCommand();
    context = {
      stdinIsPipe: false,
      snapshot: {
        directoryStructure: '',
        files: { 'test.txt': 'hello' }
      }
    };
    options = {};
    vi.clearAllMocks();
  });

  it('should fail if snapshot path is missing', async () => {
    const result = await command.execute([], options, context);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing snapshot path');
  });

  it('should initialize server and mount filesystem', async () => {
    // We use a fake path for snapshot
    const resultPromise = command.execute(['test.json'], options, context);
    
    // We need to trigger SIGINT to finish the command execution in the test
    // but command.execute returns a promise that resolves on shutdown.
    // So we wait a bit and then send SIGINT.
    
    await new Promise(r => setTimeout(r, 100));
    process.emit('SIGINT');
    
    const result = await resultPromise;
    
    expect(result.success).toBe(true);
    expect(webdav.WebDAVServer).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith('test.json', expect.any(String));
  });
});
