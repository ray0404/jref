/**
 * Extract Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExtractCommand } from './extract.js';
import type { CommandContext } from '../types/index.js';
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

const mockSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts\n├── package.json',
  files: {
    'src/main.ts': 'export function main() {}',
    'package.json': '{"name": "test"}'
  }
};

describe('ExtractCommand', () => {
  let command: ExtractCommand;
  let mockContext: CommandContext;
  const testOutputDir = './test-extracted';

  beforeEach(() => {
    command = new ExtractCommand();
    mockContext = {
      stdin: JSON.stringify(mockSnapshot),
      stdinIsPipe: true
    };
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('extract');
  });

  it('should extract all files when no patterns provided', async () => {
    const result = await command.execute(['--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(true);
    expect(readFileSync(join(testOutputDir, 'src/main.ts'), 'utf8')).toBe(mockSnapshot.files['src/main.ts']);
  });

  it('should extract matching files with wildcard pattern', async () => {
    const result = await command.execute(['--output', testOutputDir, 'src/*.ts'], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(false);
  });

  it('should handle dry-run mode', async () => {
    const result = await command.execute(['--dry-run', '--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(testOutputDir)).toBe(false);
  });

  it('should support piped input patterns', async () => {
    // When stdin is pipe, args are patterns
    const result = await command.execute(['package.json', '--output', testOutputDir], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'package.json'))).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(false);
  });

  it('should handle non-piped input with file path', async () => {
    // Create a temporary snapshot file
    const snapshotPath = 'test-snap.json';
    writeFileSync(snapshotPath, JSON.stringify(mockSnapshot));

    const nonPipedContext: CommandContext = {
      stdinIsPipe: false
    };

    const result = await command.execute([snapshotPath, 'src/**', '--output', testOutputDir], { json: true }, nonPipedContext);

    expect(result.success).toBe(true);
    expect(existsSync(join(testOutputDir, 'src/main.ts'))).toBe(true);
    
    rmSync(snapshotPath);
  });
});
