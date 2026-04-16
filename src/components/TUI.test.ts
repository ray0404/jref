/**
 * TUI Components Tests
 */

import { describe, it, expect } from 'vitest';
import { buildFlatTree } from './TUI.js';
import type { TreeNode } from '../utils/ui.js';

describe('buildFlatTree', () => {
  it('should build flat tree with proper depth and expansion', () => {
    const root: TreeNode = {
      name: '',
      path: '',
      isDirectory: true,
      children: [
        {
          name: 'project',
          path: 'project',
          isDirectory: true,
          children: [
            {
              name: 'src',
              path: 'project/src',
              isDirectory: true,
              children: [
                {
                  name: 'main.ts',
                  path: 'project/src/main.ts',
                  isDirectory: false,
                  children: []
                }
              ]
            },
            {
              name: 'package.json',
              path: 'project/package.json',
              isDirectory: false,
              children: []
            }
          ]
        }
      ]
    };

    const expanded = new Set(['']);
    const items = buildFlatTree(root, expanded);

    expect(items).toHaveLength(3);
    expect(items[0].node.name).toBe('project');
    expect(items[0].node.path).toBe(''); // Relative path for project root
    expect(items[0].depth).toBe(0);
    expect(items[1].node.name).toBe('src');
    expect(items[1].node.path).toBe('src'); // Relative path
    expect(items[1].depth).toBe(1);
    expect(items[2].node.name).toBe('package.json');
    expect(items[2].node.path).toBe('package.json'); // Relative path
    expect(items[2].depth).toBe(1);
  });

  it('should handle expanded directories', () => {
    const root: TreeNode = {
      name: '',
      path: '',
      isDirectory: true,
      children: [
        {
          name: 'project',
          path: 'project',
          isDirectory: true,
          children: [
            {
              name: 'src',
              path: 'project/src',
              isDirectory: true,
              children: [
                {
                  name: 'main.ts',
                  path: 'project/src/main.ts',
                  isDirectory: false,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    };

    const expanded = new Set(['', 'src']);
    const items = buildFlatTree(root, expanded);

    expect(items).toHaveLength(3);
    expect(items[0].node.name).toBe('project');
    expect(items[0].node.path).toBe('');
    expect(items[0].depth).toBe(0);
    expect(items[0].isExpanded).toBe(true);
    expect(items[1].node.name).toBe('src');
    expect(items[1].node.path).toBe('src');
    expect(items[1].depth).toBe(1);
    expect(items[1].isExpanded).toBe(true);
    expect(items[2].node.name).toBe('main.ts');
    expect(items[2].node.path).toBe('src/main.ts');
    expect(items[2].depth).toBe(2);
  });

  it('should handle multi-root repository (no single container)', () => {
    // Represents a monorepo with multiple top-level directories (e.g., repomix output)
    const root: TreeNode = {
      name: '',
      path: '',
      isDirectory: true,
      children: [
        {
          name: '.claude',
          path: '.claude',
          isDirectory: true,
          children: [
            {
              name: 'skills',
              path: '.claude/skills',
              isDirectory: true,
              children: [
                {
                  name: 'sonic-dsp',
                  path: '.claude/skills/sonic-dsp',
                  isDirectory: true,
                  children: [
                    {
                      name: 'SKILL.md',
                      path: '.claude/skills/sonic-dsp/SKILL.md',
                      isDirectory: false,
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'libs',
          path: 'libs',
          isDirectory: true,
          children: [
            {
              name: 'sonic-dsp-kernel',
              path: 'libs/sonic-dsp-kernel',
              isDirectory: true,
              children: [
                {
                  name: 'dsp',
                  path: 'libs/sonic-dsp-kernel/dsp',
                  isDirectory: true,
                  children: [
                    {
                      name: 'fft.zig',
                      path: 'libs/sonic-dsp-kernel/dsp/fft.zig',
                      isDirectory: false,
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'package.json',
          path: 'package.json',
          isDirectory: false,
          children: []
        }
      ]
    };

    const expanded = new Set(['', '.claude', '.claude/skills', '.claude/skills/sonic-dsp', 'libs', 'libs/sonic-dsp-kernel', 'libs/sonic-dsp-kernel/dsp']);
    const items = buildFlatTree(root, expanded);

    // Expect: top-level dirs (.claude, libs), files at root, nested dirs and files
    expect(items.length).toBeGreaterThan(8);

    // Check .claude is present with full path
    const claude = items.find(i => i.node.path === '.claude');
    expect(claude).toBeDefined();
    expect(claude?.node.isDirectory).toBe(true);
    expect(claude?.depth).toBe(0);

    // Check SKILL.md path includes full prefix
    const skill = items.find(i => i.node.path === '.claude/skills/sonic-dsp/SKILL.md');
    expect(skill).toBeDefined();
    expect(skill?.node.isDirectory).toBe(false);
    expect(skill?.depth).toBe(3);

    // Check fft.zig path includes full prefix
    const fft = items.find(i => i.node.path === 'libs/sonic-dsp-kernel/dsp/fft.zig');
    expect(fft).toBeDefined();
    expect(fft?.depth).toBe(3);

    // Root file package.json should have path as just its name
    const pkg = items.find(i => i.node.path === 'package.json');
    expect(pkg).toBeDefined();
    expect(pkg?.depth).toBe(0);
  });
});