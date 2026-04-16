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
});