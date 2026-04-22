/**
 * Pack Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PackCommand } from './pack.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, resolve } from 'path';

describe('PackCommand', () => {
  let command: PackCommand;
  const testRootDir = './test-pack-root';

  beforeEach(() => {
    command = new PackCommand();
    if (existsSync(testRootDir)) {
      rmSync(testRootDir, { recursive: true, force: true });
    }
    mkdirSync(testRootDir);
    mkdirSync(join(testRootDir, 'src'));
    writeFileSync(join(testRootDir, 'src/main.ts'), 'export function main() {}');
    writeFileSync(join(testRootDir, 'package.json'), '{"name": "test"}');
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('pack');
  });

  it('should pack a simple directory', async () => {
    const result = await command.execute([testRootDir], { json: true, silent: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    const snapshot = JSON.parse(result.output!);
    
    // Repomix might return absolute or relative paths depending on config
    // In our case we expect relative paths in the snapshot
    expect(snapshot.files).toBeDefined();
    expect(Object.keys(snapshot.files).length).toBeGreaterThanOrEqual(2);
    
    // Check if files exist (exact path depends on repomix behavior with cwd)
    const paths = Object.keys(snapshot.files);
    expect(paths.some(p => p.endsWith('main.ts'))).toBe(true);
    expect(paths.some(p => p.endsWith('package.json'))).toBe(true);
  });

  it('should include instructions and summary', async () => {
    const result = await command.execute([
        testRootDir, 
        '--instruction', 'test instruction',
        '--summary', 'test summary'
    ], { json: true, silent: true }, { stdinIsPipe: false });

    expect(result.success).toBe(true);
    const snapshot = JSON.parse(result.output!);
    expect(snapshot.instruction).toBe('test instruction');
    expect(snapshot.fileSummary).toBe('test summary');
  });
});
