import { describe, it, expect } from 'vitest';
import { createGraph, getBlastRadius, getCommunityNodes } from './graph-analysis.js';
import { GraphSnapshot } from '../types/index.js';

describe('Graph Analysis Utils', () => {
  const mockSnapshot: GraphSnapshot = {
    nodes: [
      { id: 'A', label: 'A', type: 'code', source_file: 'A.ts', community: 1 },
      { id: 'B', label: 'B', type: 'code', source_file: 'B.ts', community: 1 },
      { id: 'C', label: 'C', type: 'code', source_file: 'C.ts', community: 2 },
      { id: 'D', label: 'D', type: 'code', source_file: 'D.ts', community: 2 },
    ],
    edges: [
      { source: 'A', target: 'B', relation: 'imports', confidence: 'EXTRACTED', weight: 1.0 },
      { source: 'C', target: 'B', relation: 'imports', confidence: 'EXTRACTED', weight: 1.0 },
      { source: 'D', target: 'C', relation: 'imports', confidence: 'EXTRACTED', weight: 1.0 },
    ],
  };

  it('should create a graphology instance', () => {
    const graph = createGraph(mockSnapshot);
    expect(graph.order).toBe(4);
    expect(graph.size).toBe(3);
    expect(graph.hasEdge('A', 'B')).toBe(true);
  });

  it('should calculate blast radius (dependents)', () => {
    const graph = createGraph(mockSnapshot);
    
    // B is imported by A and C. So B affects A and C.
    const radiusB = getBlastRadius(graph, 'B', 1);
    expect(radiusB).toContain('A');
    expect(radiusB).toContain('C');
    expect(radiusB.length).toBe(2);

    // C is imported by D. So C affects D.
    // But C also affects things that import it.
    // Wait, B affects C (inbound to B is C). C affects D (inbound to C is D).
    // So blast radius of B at depth 2 should include D.
    const radiusB2 = getBlastRadius(graph, 'B', 2);
    expect(radiusB2).toContain('A');
    expect(radiusB2).toContain('C');
    expect(radiusB2).toContain('D');
    expect(radiusB2.length).toBe(3);
  });

  it('should get community nodes', () => {
    const nodes1 = getCommunityNodes(mockSnapshot, 1);
    expect(nodes1).toContain('A');
    expect(nodes1).toContain('B');
    expect(nodes1.length).toBe(2);

    const nodes2 = getCommunityNodes(mockSnapshot, 2);
    expect(nodes2).toContain('C');
    expect(nodes2).toContain('D');
    expect(nodes2.length).toBe(2);
  });
});
