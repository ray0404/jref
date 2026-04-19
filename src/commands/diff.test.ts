
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiffCommand } from './diff.js';
import type { ProjectSnapshot } from '../types/index.js';
import * as fs from 'fs';

vi.mock('fs');

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
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue('modified content');
    (fs.lstatSync as any).mockReturnValue({ isDirectory: () => false });

    const context = { snapshot: mockSnapshot, stdinIsPipe: false };
    const result = await command.execute([], { json: true }, context);
    
    const output = JSON.parse(result.output!);
    expect(output.modifiedFiles).toContain('src/main.ts');
  });

  it('should identify a missing local file (Added to snapshot)', async () => {
    (fs.existsSync as any).mockReturnValue(false);

    const context = { snapshot: mockSnapshot, stdinIsPipe: false };
    const result = await command.execute([], { json: true }, context);
    
    const output = JSON.parse(result.output!);
    expect(output.missingFiles).toContain('src/main.ts');
  });
});
