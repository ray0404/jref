import { DirectedGraph } from 'graphology';
import louvain from 'graphology-communities-louvain';
import * as centrality from 'graphology-metrics/centrality/index.js';
import { GraphSnapshot } from '../types/index.js';

/**
 * Utility for topological clustering and analysis of the knowledge graph.
 */

export interface AnalysisResult {
  graph: GraphSnapshot;
  godNodes: { id: string, centrality: number }[];
  communities: Record<number, string[]>;
}

/**
 * Analyzes the graph topology to detect communities and central nodes.
 */
export function analyzeGraph(snapshot: GraphSnapshot): AnalysisResult {
  const graph = createGraph(snapshot);

  // Louvain Community Detection
  const communities = (louvain as any)(graph) as Record<string, number>;
  
  // Assign community to nodes in the snapshot
  const updatedNodes = snapshot.nodes.map(node => ({
    ...node,
    community: communities[node.id]
  }));

  // Degree Centrality to find "God Nodes"
  const degrees = (centrality as any).degree(graph) as Record<string, number>;
  const godNodes = Object.entries(degrees)
    .map(([id, score]) => ({ id, centrality: score }))
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, 10);

  // Group nodes by community
  const communityGroups: Record<number, string[]> = {};
  for (const [id, communityId] of Object.entries(communities)) {
    if (!communityGroups[communityId]) {
      communityGroups[communityId] = [];
    }
    communityGroups[communityId].push(id);
  }

  return {
    graph: {
      nodes: updatedNodes,
      edges: snapshot.edges
    },
    godNodes,
    communities: communityGroups
  };
}

/**
 * Creates a graphology instance from a snapshot.
 */
export function createGraph(snapshot: GraphSnapshot): DirectedGraph {
  const graph = new DirectedGraph();

  // Add nodes
  for (const node of snapshot.nodes) {
    if (!graph.hasNode(node.id)) {
      graph.addNode(node.id, { ...node });
    }
  }

  // Add edges
  for (const edge of snapshot.edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      if (!graph.hasEdge(edge.source, edge.target)) {
        graph.addEdge(edge.source, edge.target, { 
          relation: edge.relation,
          weight: edge.weight || 1.0,
          confidence: edge.confidence
        });
      }
    }
  }

  return graph;
}

/**
 * Traverses inbound edges (dependents) to see what is affected by a node.
 * Following the prompt's request for "blast radius".
 */
export function getBlastRadius(graph: DirectedGraph, nodeId: string, depth: number = 1): string[] {
  if (!graph.hasNode(nodeId)) return [];

  const affected = new Set<string>();
  let currentLevel = [nodeId];
  
  for (let i = 0; i < depth; i++) {
    const nextLevel: string[] = [];
    for (const node of currentLevel) {
      graph.forEachInboundNeighbor(node, (neighbor) => {
        if (!affected.has(neighbor) && neighbor !== nodeId) {
          affected.add(neighbor);
          nextLevel.push(neighbor);
        }
      });
    }
    if (nextLevel.length === 0) break;
    currentLevel = nextLevel;
  }
  
  return Array.from(affected);
}

/**
 * Returns all nodes sharing a community ID.
 */
export function getCommunityNodes(snapshot: GraphSnapshot, communityId: number): string[] {
  return snapshot.nodes
    .filter(n => n.community === communityId)
    .map(n => n.id);
}

/**
 * Generates a report summary from the analysis.
 */
export function generateGraphReport(result: AnalysisResult): string {
  let report = '# JREF Knowledge Graph Report\n\n';
  
  report += '## God Nodes (Most Central Symbols)\n';
  for (const node of result.godNodes) {
    report += `- **${node.id}** (Centrality: ${node.centrality.toFixed(2)})\n`;
  }
  
  report += '\n## Modular Communities\n';
  for (const [id, nodes] of Object.entries(result.communities)) {
    report += `### Community ${id} (${nodes.length} nodes)\n`;
    // List top 5 nodes in this community by centrality
    const topInCommunity = nodes
      .map(nodeId => ({ id: nodeId, centrality: result.godNodes.find(g => g.id === nodeId)?.centrality || 0 }))
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 5);
      
    for (const node of topInCommunity) {
      report += `- ${node.id}\n`;
    }
    if (nodes.length > 5) {
      report += `- ... and ${nodes.length - 5} more\n`;
    }
    report += '\n';
  }
  
  return report;
}
