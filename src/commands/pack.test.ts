
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PackCommand } from './pack.js';
import * as fs from 'fs';
import { join } from 'path';

vi.mock('fs');

describe('PackCommand', () => {
  let command: PackCommand;

  beforeEach(() => {
    command = new PackCommand();
    vi.clearAllMocks();
  });

  it('should be registered', () => {
    expect(command.definition.name).toBe('pack');
  });

  it('should pack a simple directory', async () => {
    (fs.existsSync as any).mockImplementation((path: string) => {
        if (path === 'root') return true;
        if (path.endsWith('.gitignore')) return false;
        return false;
    });
    (fs.readdirSync as any).mockImplementation((dir: string) => {
        if (dir === 'root') return ['src', 'package.json'];
        if (dir.endsWith('src')) return ['main.ts'];
        return [];
    });
    (fs.lstatSync as any).mockImplementation((path: string) => {
        const isDir = path.endsWith('src') || path === 'root';
        return { isDirectory: () => isDir };
    });
    (fs.readFileSync as any).mockReturnValue('content');

    const result = await command.execute(['root'], { json: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    const snapshot = JSON.parse(result.output!);
    expect(snapshot.files['src/main.ts']).toBe('content');
    expect(snapshot.files['package.json']).toBe('content');
    expect(snapshot.directoryStructure).toContain('src');
    expect(snapshot.directoryStructure).toContain('main.ts');
  });
});
