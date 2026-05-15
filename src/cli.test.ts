import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main } from './cli.js';
import { registry } from './utils/command.js';

// Mock the command module to prevent real registration during tests
vi.mock('./utils/command.js', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    registerBuiltinCommands: vi.fn().mockResolvedValue(undefined),
  };
});

describe('CLI Entry Point (index.ts)', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Prevent process.exit
    vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined): never => {
      throw new Error(`process.exit(${code})`);
    });
    // Suppress console logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  it('should route to bin command when invoked as jbin', async () => {
    // Mock argv to simulate jbin call
    process.argv = ['node', '/usr/bin/jbin', 'my-tool', 'script.js'];

    const executeSpy = vi.fn().mockResolvedValue({ success: true, exitCode: 0 });
    const mockCommand = {
      definition: { name: 'bin' },
      execute: executeSpy,
      printHelp: vi.fn()
    };
    
    vi.spyOn(registry, 'get').mockImplementation((name) => {
      if (name === 'bin') return mockCommand as any;
      return undefined;
    });

    try {
      await main();
    } catch (e: any) {
      if (!e.message.includes('process.exit')) throw e;
    }

    expect(executeSpy).toHaveBeenCalled();
    const args = executeSpy.mock.calls[0][0];
    expect(args).toEqual(['my-tool', 'script.js']);
  });

  it('should route to bin command when argv[0] is jbin', async () => {
    process.argv = ['/usr/bin/jbin', 'ignore-me', 'my-tool', 'script.js'];

    const executeSpy = vi.fn().mockResolvedValue({ success: true, exitCode: 0 });
    const mockCommand = {
      definition: { name: 'bin' },
      execute: executeSpy,
      printHelp: vi.fn()
    };
    
    vi.spyOn(registry, 'get').mockImplementation((name) => {
      if (name === 'bin') return mockCommand as any;
      return undefined;
    });

    try {
      await main();
    } catch (e: any) {
      if (!e.message.includes('process.exit')) throw e;
    }

    expect(executeSpy).toHaveBeenCalled();
    const args = executeSpy.mock.calls[0][0];
    expect(args).toEqual(['my-tool', 'script.js']);
  });
});
