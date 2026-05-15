import { describe, it, expect } from 'vitest';
import { createGraph, getBlastRadius, getCommunityNodes, exportToGML, exportToGraphML, queryGraph } from './graph-analysis.js';
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

    // B affects C, and C affects D. Blast radius B at depth 2 includes D.
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

  it('should export to GML', () => {
    const graph = createGraph(mockSnapshot);
    // Add centrality to one node manually for test if analyzeGraph not called
    graph.setNodeAttribute('A', 'centrality', 0.5);
    const gml = exportToGML(graph);
    expect(gml).toContain('graph [');
    expect(gml).toContain('node [');
    expect(gml).toContain('id "A"');
    expect(gml).toContain('centrality 0.5');
    expect(gml).toContain('edge [');
    expect(gml).toContain('source "A"');
    expect(gml).toContain('target "B"');
  });

  it('should export to GraphML', () => {
    const graph = createGraph(mockSnapshot);
    const graphml = exportToGraphML(graph);
    expect(graphml).toContain('<graphml');
    expect(graphml).toContain('<node id="A"');
    expect(graphml).toContain('source="A" target="B"');
  });

  it('should execute a simple Cypher-like query', () => {
    const graph = createGraph(mockSnapshot);
    // Find all nodes that import B
    const query = 'MATCH (n)-[r:imports]->(m:B) RETURN n';
    const results = queryGraph(graph, query);
    expect(results).toContain('A');
    expect(results).toContain('C');
    expect(results.length).toBe(2);
  });
});
