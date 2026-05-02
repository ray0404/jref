import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateFileHashMap, getDeltaPaths } from './hashing.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('Hashing Utilities', () => {
  const testDir = './test-hashing';

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should generate hash map for a directory', () => {
    writeFileSync(join(testDir, 'file1.txt'), 'hello');
    writeFileSync(join(testDir, 'file2.txt'), 'world');

    const hashMap = generateFileHashMap(testDir);
    expect(Object.keys(hashMap)).toHaveLength(2);
    expect(hashMap['file1.txt']).toBeDefined();
    expect(hashMap['file2.txt']).toBeDefined();
    expect(hashMap['file1.txt']).not.toBe(hashMap['file2.txt']);
  });

  it('should detect deltas', () => {
    const localMap = {
      'file1.txt': 'hash1-new',
      'file2.txt': 'hash2',
      'file3.txt': 'hash3'
    };
    const remoteMap = {
      'file1.txt': 'hash1-old',
      'file2.txt': 'hash2'
    };

    const deltas = getDeltaPaths(localMap, remoteMap);
    expect(deltas).toContain('file1.txt');
    expect(deltas).toContain('file3.txt');
    expect(deltas).not.toContain('file2.txt');
  });
});
