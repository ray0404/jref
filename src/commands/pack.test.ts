/**
 * Pack Command Caching Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PackCommand } from './pack.js';
import { existsSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import * as repomix from 'repomix';

vi.mock('repomix', async () => {
  const actual = await vi.importActual('repomix');
  return {
    ...actual as any,
    runRemoteAction: vi.fn(),
    pack: vi.fn(),
  };
});

// Mocking git ls-remote to simulate remote head check
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual('node:child_process');
  return {
    ...actual as any,
    execSync: vi.fn((command) => {
      if (command.includes('git ls-remote')) {
        return 'mock-sha1 HEAD';
      }
      return '';
    }),
  };
});

describe('PackCommand Caching', () => {
  let command: PackCommand;
  const cacheDir = join(homedir(), '.jref', 'cache');

  beforeEach(() => {
    command = new PackCommand();
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
  });

  it('should cache remote repositories and reuse them', async () => {
    const remoteUrl = 'https://github.com/user/repo';
    const mockSnapshot = {
      directoryStructure: 'test.ts',
      files: { 'test.ts': 'console.log("cached")' },
      instruction: 'Analyze this.'
    };

    // First call: Network hit
    const mockRunRemoteAction = vi.spyOn(repomix, 'runRemoteAction').mockResolvedValue({
      packResult: {
        processedFiles: [{ path: 'test.ts', content: 'console.log("cached")' }]
      }
    } as any);

    await command.execute([remoteUrl], { silent: true }, { stdinIsPipe: false });
    
    expect(mockRunRemoteAction).toHaveBeenCalledTimes(1);
    
    // Verify cache exists
    expect(existsSync(cacheDir)).toBe(true);

    // Second call: Cache hit (mock git ls-remote returns same hash)
    mockRunRemoteAction.mockClear();
    
    await command.execute([remoteUrl], { silent: true }, { stdinIsPipe: false });
    
    // Should NOT call runRemoteAction again because hashes match
    expect(mockRunRemoteAction).toHaveBeenCalledTimes(0);
  });
});
