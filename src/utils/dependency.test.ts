import { describe, it, expect } from 'vitest';
import { getBlastRadius, DependencyGraph } from './dependency.js';

describe('Dependency Utils - getBlastRadius', () => {
  it('should find direct dependents at depth 1', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/core.ts': ['src/app.ts', 'src/utils.ts'],
        'src/utils.ts': ['src/helper.ts'],
      }
    };

    const result = getBlastRadius(['src/core.ts'], graph, 1);
    expect(result.sort()).toEqual(['src/app.ts', 'src/utils.ts'].sort());
  });

  it('should find transitive dependents at depth > 1', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/core.ts': ['src/app.ts', 'src/utils.ts'],
        'src/utils.ts': ['src/helper.ts'],
      }
    };

    const result = getBlastRadius(['src/core.ts'], graph, 2);
    expect(result.sort()).toEqual(['src/app.ts', 'src/utils.ts', 'src/helper.ts'].sort());
  });

  it('should exclude initially changed files from the result', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/core.ts': ['src/app.ts', 'src/core.ts'], // self dependency
        'src/app.ts': ['src/main.ts'],
      }
    };

    const result = getBlastRadius(['src/core.ts'], graph, 2);
    expect(result.sort()).toEqual(['src/app.ts', 'src/main.ts'].sort());
  });

  it('should handle cyclic dependencies gracefully', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/a.ts': ['src/b.ts'],
        'src/b.ts': ['src/a.ts', 'src/c.ts'],
        'src/c.ts': ['src/d.ts'],
      }
    };

    const result = getBlastRadius(['src/a.ts'], graph, 3);
    // Depth 1: a -> b
    // Depth 2: b -> a (excluded since initial), b -> c
    // Depth 3: c -> d
    expect(result.sort()).toEqual(['src/b.ts', 'src/c.ts', 'src/d.ts'].sort());
  });

  it('should return empty when no dependents exist', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/a.ts': ['src/b.ts'],
      }
    };

    const result = getBlastRadius(['src/c.ts'], graph, 1);
    expect(result).toEqual([]);
  });

  it('should return empty when changedFiles is empty', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/a.ts': ['src/b.ts'],
      }
    };

    const result = getBlastRadius([], graph, 1);
    expect(result).toEqual([]);
  });

  it('should aggregate dependents from multiple changed files', () => {
    const graph: DependencyGraph = {
      dependents: {
        'src/a.ts': ['src/x.ts'],
        'src/b.ts': ['src/y.ts'],
        'src/x.ts': ['src/z.ts'],
      }
    };

    const result = getBlastRadius(['src/a.ts', 'src/b.ts'], graph, 2);
    expect(result.sort()).toEqual(['src/x.ts', 'src/y.ts', 'src/z.ts'].sort());
  });
});
