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

  it('should parse repomix-style 2-space indentation', () => {
    // This format is produced by repomix when packing projects
    const structure = `.claude/
  skills/
    sonic-dsp/
      references/
        files.md
        project-structure.md
      SKILL.md
libs/
  sonic-dsp-kernel/
    dsp/
      amber_tape.zig
      fft.zig
    plugins/
      soniclimiter.zig`;

    const root = parseDirectoryStructure(structure);

    // Root has two top-level entries: .claude and libs
    expect(root.children).toHaveLength(2);

    const claude = root.children.find(c => c.name === '.claude');
    expect(claude).toBeDefined();
    expect(claude?.children).toHaveLength(1); // skills

    const skills = claude?.children[0];
    expect(skills.name).toBe('skills');
    expect(skills.children).toHaveLength(1); // sonic-dsp

    const sonicDsp = skills.children[0];
    expect(sonicDsp.name).toBe('sonic-dsp');
    expect(sonicDsp.children).toHaveLength(2); // references, SKILL.md

    const references = sonicDsp.children.find(c => c.name === 'references');
    expect(references).toBeDefined();
    expect(references?.children).toHaveLength(2); // files.md, project-structure.md

    const filesMd = references?.children[0];
    expect(filesMd?.name).toBe('files.md');
    expect(filesMd?.isDirectory).toBe(false);
    expect(filesMd?.path).toBe('.claude/skills/sonic-dsp/references/files.md');

    const skillMd = sonicDsp.children.find(c => c.name === 'SKILL.md');
    expect(skillMd?.isDirectory).toBe(false);
    expect(skillMd?.path).toBe('.claude/skills/sonic-dsp/SKILL.md');

    // Check libs branch
    const libs = root.children.find(c => c.name === 'libs');
    expect(libs).toBeDefined();
    expect(libs?.children).toHaveLength(1); // sonic-dsp-kernel

    const kernel = libs?.children[0];
    expect(kernel.name).toBe('sonic-dsp-kernel');
    expect(kernel.children).toHaveLength(2); // dsp, plugins

    const dsp = kernel.children.find(c => c.name === 'dsp');
    expect(dsp).toBeDefined();
    expect(dsp?.children).toHaveLength(2); // amber_tape.zig, fft.zig
  });

  it('should handle mixed plain indentation with trailing files at root level', () => {
    const structure = `src/
  main.ts
  utils/
    helper.ts
README.md
package.json`;

    const root = parseDirectoryStructure(structure);
    expect(root.children).toHaveLength(3); // src, README.md, package.json

    const src = root.children.find(c => c.name === 'src');
    expect(src).toBeDefined();
    expect(src?.children).toHaveLength(2); // main.ts, utils

    const main = src?.children.find(c => c.name === 'main.ts');
    expect(main?.isDirectory).toBe(false);
    expect(main?.path).toBe('src/main.ts');

    const utils = src?.children.find(c => c.name === 'utils');
    expect(utils?.isDirectory).toBe(true);
    expect(utils?.children).toHaveLength(1);

    const helper = utils?.children[0];
    expect(helper.name).toBe('helper.ts');
    expect(helper.path).toBe('src/utils/helper.ts');
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