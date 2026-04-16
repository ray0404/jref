/**
 * UI Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { parseDirectoryStructure, getAllFilePaths, findNodeByPath } from './ui.js';

describe('parseDirectoryStructure', () => {
  it('should parse simple tree structure', () => {
    const structure = `project/
├── src/
│   └── main.ts
├── package.json
└── README.md`;

    const root = parseDirectoryStructure(structure);

    expect(root.name).toBe('');
    expect(root.isDirectory).toBe(true);
    expect(root.children).toHaveLength(1);

    const project = root.children[0];
    expect(project.name).toBe('project');
    expect(project.isDirectory).toBe(true);
    expect(project.children).toHaveLength(3);

    const src = project.children.find(c => c.name === 'src');
    expect(src?.isDirectory).toBe(true);
    expect(src?.children).toHaveLength(1);

    const mainTs = src?.children[0];
    expect(mainTs?.name).toBe('main.ts');
    expect(mainTs?.isDirectory).toBe(false);
    expect(mainTs?.path).toBe('project/src/main.ts');
  });

  it('should parse nested directories', () => {
    const structure = `root/
├── folder1/
│   ├── subfolder/
│   │   └── file.txt
│   └── another.txt
└── folder2/
    └── data.json`;

    const root = parseDirectoryStructure(structure);

    const rootDir = root.children[0];
    expect(rootDir.children).toHaveLength(2);

    const folder1 = rootDir.children[0];
    expect(folder1.name).toBe('folder1');
    expect(folder1.children).toHaveLength(2);

    const subfolder = folder1.children[0];
    expect(subfolder.name).toBe('subfolder');
    expect(subfolder.children).toHaveLength(1);
  });
});

describe('getAllFilePaths', () => {
  it('should extract all file paths', () => {
    const structure = `project/
├── src/
│   ├── main.ts
│   └── utils.ts
├── package.json
└── docs/
    └── README.md`;

    const root = parseDirectoryStructure(structure);
    const files = getAllFilePaths(root);

    expect(files).toEqual([
      'project/src/main.ts',
      'project/src/utils.ts',
      'project/package.json',
      'project/docs/README.md'
    ]);
  });
});

describe('findNodeByPath', () => {
  it('should find node by path', () => {
    const structure = `project/
├── src/
│   └── main.ts
└── package.json`;

    const root = parseDirectoryStructure(structure);
    const node = findNodeByPath(root, 'project/src/main.ts');

    expect(node?.name).toBe('main.ts');
    expect(node?.isDirectory).toBe(false);
  });

  it('should return null for non-existent path', () => {
    const structure = `project/
└── src/
    └── main.ts`;

    const root = parseDirectoryStructure(structure);
    const node = findNodeByPath(root, 'nonexistent.ts');

    expect(node).toBeNull();
  });
});