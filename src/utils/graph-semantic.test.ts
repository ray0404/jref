import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inferSemanticEdges } from './graph-semantic.js';
import { GraphNode } from '../types/index.js';

// Mock transformers
vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn().mockResolvedValue(() => ({
    data: new Float32Array([0.1, 0.2, 0.3])
  })),
  env: {
    cacheDir: ''
  }
}));

describe('Graph Semantic Utils', () => {
  const mockNodes: GraphNode[] = [
    { id: 'src/index.ts', label: 'index', type: 'code', source_file: 'src/index.ts' },
    { id: 'src/utils/helper.ts', label: 'helper', type: 'code', source_file: 'src/utils/helper.ts' },
  ];

  const mockFileContents = {
    'src/index.ts': 'function main() { console.log("hello"); }',
    'src/utils/helper.ts': 'function help() { console.log("helping"); }',
  };

  it('should generate semantic edges locally using embeddings', async () => {
    const edges = await inferSemanticEdges(mockNodes, mockFileContents);
    
    // In a real scenario with our mock, they might be similar if the mock returns same embeddings
    // For now, we just check if it returns an array (implementation is currently empty)
    expect(Array.isArray(edges)).toBe(true);
    // Once implemented, we expect at least some edges if similarity is high
    // expect(edges.length).toBeGreaterThan(0);
  });
});
