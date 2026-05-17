
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiffCommand } from './diff.js';
import type { ProjectSnapshot } from '../types/index.js';
import * as fs from 'fs';
import * as fsp from 'fs/promises';

vi.mock('fs');
vi.mock('fs/promises');

describe('DiffCommand', () => {
  let command: DiffCommand;
  let mockSnapshot: ProjectSnapshot;

  beforeEach(() => {
    command = new DiffCommand();
    mockSnapshot = {
      directoryStructure: 'src/main.ts',
      files: {
        'src/main.ts': 'original content'
      }
    };
    vi.clearAllMocks();
  });

  it('should identify a modified file', async () => {
    (fsp.stat as any).mockResolvedValue({ isDirectory: () => false });
    (fsp.readFile as any).mockResolvedValue('modified content');


    const context = { snapshot: mockSnapshot, stdinIsPipe: false };
    const result = await command.execute([], { json: true }, context);
    
    const output = JSON.parse(result.output!);
    expect(output.modifiedFiles.some((f: any) => f.path === 'src/main.ts')).toBe(true);
  });

  it('should identify a missing local file (Added to snapshot)', async () => {
    (fsp.stat as any).mockRejectedValue(new Error('ENOENT'));

    const context = { snapshot: mockSnapshot, stdinIsPipe: false };
    const result = await command.execute([], { json: true }, context);
    
    const output = JSON.parse(result.output!);
    expect(output.missingFiles).toContain('src/main.ts');
  });
});
