
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatchCommand } from './patch.js';
import { registry } from '../utils/command.js';
import type { ProjectSnapshot } from '../types/index.js';

describe('PatchCommand', () => {
  let command: PatchCommand;
  let mockSnapshot: ProjectSnapshot;

  beforeEach(() => {
    command = new PatchCommand();
    mockSnapshot = {
      directoryStructure: 'project/\n├── src/\n│   └── main.ts',
      files: {
        'src/main.ts': 'console.log("hello");'
      },
      instruction: 'test instruction'
    };
  });

  it('should be registered', () => {
    expect(command.definition.name).toBe('patch');
  });

  it('should update an existing file', async () => {
    const args = ['src/main.ts', 'console.log("updated");'];
    const options = {};
    const context = {
      stdinIsPipe: false,
      snapshot: { ...mockSnapshot }
    };

    const result = await command.execute(args, options, context);
    expect(result.success).toBe(true);
    
    const updatedSnapshot = JSON.parse(result.output!);
    expect(updatedSnapshot.files['src/main.ts']).toBe('console.log("updated");');
    expect(updatedSnapshot.directoryStructure).toBe(mockSnapshot.directoryStructure);
  });

  it('should add a new file and update directoryStructure', async () => {
    const args = ['src/utils.ts', 'export const a = 1;'];
    const options = {};
    const context = {
      stdinIsPipe: false,
      snapshot: { ...mockSnapshot }
    };

    const result = await command.execute(args, options, context);
    expect(result.success).toBe(true);
    
    const updatedSnapshot = JSON.parse(result.output!);
    expect(updatedSnapshot.files['src/utils.ts']).toBe('export const a = 1;');
    expect(updatedSnapshot.directoryStructure).toContain('src/utils.ts');
  });

  it('should update metadata flags', async () => {
    const args = ['--instruction', 'new instruction', '--summary', 'new summary'];
    const options = {};
    const context = {
      stdinIsPipe: false,
      snapshot: { ...mockSnapshot }
    };

    const result = await command.execute(args, options, context);
    expect(result.success).toBe(true);
    
    const updatedSnapshot = JSON.parse(result.output!);
    expect(updatedSnapshot.instruction).toBe('new instruction');
    expect(updatedSnapshot.fileSummary).toBe('new summary');
  });

  it('should take content from stdin if only one argument is provided', async () => {
    const args = ['src/main.ts'];
    const options = {};
    const context = {
      stdinIsPipe: true,
      stdin: 'stdin content',
      snapshot: { ...mockSnapshot }
    };

    const result = await command.execute(args, options, context);
    expect(result.success).toBe(true);
    
    const updatedSnapshot = JSON.parse(result.output!);
    expect(updatedSnapshot.files['src/main.ts']).toBe('stdin content');
  });
});
