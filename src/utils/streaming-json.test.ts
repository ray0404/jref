/**
 * Streaming JSON Parser Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseJSON,
  loadSnapshot,
  calculateMetadata,
  validateSnapshot,
  getFilePaths,
  extractFiles
} from './streaming-json.js';
import type { ProjectSnapshot } from '../types/index.js';

const validSnapshot: ProjectSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': 'export function main() {}',
    'src/utils.ts': 'export function util() {}'
  },
  instruction: 'Test instruction'
};

describe('parseJSON', () => {
  it('should parse valid JSON snapshot', async () => {
    const json = JSON.stringify(validSnapshot);
    const result = await parseJSON(json);

    expect(result).toEqual(validSnapshot);
    expect(result.directoryStructure).toBe(validSnapshot.directoryStructure);
    expect(Object.keys(result.files)).toHaveLength(2);
  });

  it('should throw error for invalid JSON', async () => {
    const invalidJson = '{ invalid json }';

    await expect(parseJSON(invalidJson)).rejects.toThrow();
  });

  it('should handle empty instruction', async () => {
    const snapshot = { ...validSnapshot, instruction: undefined };
    const json = JSON.stringify(snapshot);
    const result = await parseJSON(json);

    expect(result.instruction).toBeUndefined();
  });
});

describe('calculateMetadata', () => {
  it('should calculate correct metadata', () => {
    const metadata = calculateMetadata(validSnapshot);

    expect(metadata.fileCount).toBe(2);
    expect(metadata.totalSize).toBeGreaterThan(0);
    expect(metadata.hasInstruction).toBe(true);
    expect(metadata.hasFileSummary).toBe(false);
    expect(metadata.hasUserProvidedHeader).toBe(false);
    expect(metadata.directoryStructureLines).toBe(3);
  });

  it('should detect optional fields', () => {
    const snapshot: ProjectSnapshot = {
      directoryStructure: 'test',
      files: { 'test.ts': 'content' },
      instruction: 'inst',
      fileSummary: 'summary',
      userProvidedHeader: 'header'
    };

    const metadata = calculateMetadata(snapshot);

    expect(metadata.hasInstruction).toBe(true);
    expect(metadata.hasFileSummary).toBe(true);
    expect(metadata.hasUserProvidedHeader).toBe(true);
  });
});

describe('validateSnapshot', () => {
  it('should validate correct snapshot', () => {
    expect(validateSnapshot(validSnapshot)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateSnapshot(null)).toBe(false);
  });

  it('should reject primitive', () => {
    expect(validateSnapshot('string')).toBe(false);
    expect(validateSnapshot(123)).toBe(false);
  });

  it('should reject missing required fields', () => {
    expect(validateSnapshot({ directoryStructure: 'test' })).toBe(false);
    expect(validateSnapshot({ files: {} })).toBe(false);
  });
});

describe('getFilePaths', () => {
  it('should return all file paths', () => {
    const paths = getFilePaths(validSnapshot);

    expect(paths).toHaveLength(2);
    expect(paths).toContain('src/main.ts');
    expect(paths).toContain('src/utils.ts');
  });

  it('should filter by prefix', () => {
    const paths = getFilePaths(validSnapshot, 'src/');

    expect(paths).toHaveLength(2);
  });

  it('should return empty for non-matching prefix', () => {
    const paths = getFilePaths(validSnapshot, 'nonexistent/');

    expect(paths).toHaveLength(0);
  });
});

describe('extractFiles', () => {
  it('should extract specific files', () => {
    const result = extractFiles(validSnapshot, ['src/main.ts']);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['src/main.ts']).toBe(validSnapshot.files['src/main.ts']);
  });

  it('should return empty object for non-existent paths', () => {
    const result = extractFiles(validSnapshot, ['nonexistent.ts']);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should extract multiple files', () => {
    const result = extractFiles(validSnapshot, ['src/main.ts', 'src/utils.ts']);

    expect(Object.keys(result)).toHaveLength(2);
  });
});