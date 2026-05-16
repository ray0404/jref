/**
 * @module GraphAnalysis
 * Topological clustering and structural analysis of knowledge graphs.
 * 
 * This module provides the engine for analyzing symbol dependencies, detecting 
 * logical communities (clusters), and identifying "God Nodes" (highly central symbols).
 * It enables "Blast Radius" analysis to see how a change in one module might 
 * ripple through the rest of the application.
 */

import { DirectedGraph } from 'graphology';
import louvain from 'graphology-communities-louvain';
import * as centrality from 'graphology-metrics/centrality/index.js';
import { GraphSnapshot } from '../types/index.js';

/**
 * Result of a structural graph analysis.
 */
export interface AnalysisResult {
  /**
   * The updated graph snapshot with community and centrality data injected into nodes.
   */
  graph: GraphSnapshot;
  /**
   * Top 10 most central nodes in the graph ("God Nodes").
   */
  godNodes: { id: string, centrality: number }[];
  /**
   * Map of community IDs to arrays of node IDs belonging to those communities.
   */
  communities: Record<number, string[]>;
}

/**
 * Analyzes the graph topology using the Louvain method for community detection
 * and Degree Centrality for identifying key hubs.
 * 
 * @param snapshot - The raw graph snapshot to analyze.
 * @returns An AnalysisResult containing topological insights.
 */
export function analyzeGraph(snapshot: GraphSnapshot): AnalysisResult {
  const graph = createGraph(snapshot);

  // Louvain Community Detection
  const communities = (louvain as any)(graph) as Record<string, number>;
  
  // Degree Centrality to find "God Nodes"
  const degrees = (centrality as any).degree(graph) as Record<string, number>;

  // Assign community and centrality to nodes in the snapshot
  const updatedNodes = snapshot.nodes.map(node => ({
    ...node,
    community: communities[node.id],
    centrality: degrees[node.id] || 0
  }));

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
 * Converts a static GraphSnapshot into a live `graphology` DirectedGraph instance.
 * 
 * @param snapshot - The snapshot data.
 * @returns A live DirectedGraph instance for analysis.
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
 * Calculates the "Blast Radius" of a node by traversing inbound edges (dependents).
 * Identifies all symbols that directly or indirectly depend on the target node.
 * 
 * @param graph - The graph to traverse.
 * @param nodeId - The ID of the node starting the traversal.
 * @param depth - How many levels of dependency to traverse (default: 1).
 * @returns Array of node IDs within the blast radius.
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
 * Returns all node IDs sharing a specific community ID within a snapshot.
 * 
 * @param snapshot - The snapshot containing community data.
 * @param communityId - The target community ID.
 * @returns Array of matching node IDs.
 */
export function getCommunityNodes(snapshot: GraphSnapshot, communityId: number): string[] {
  return snapshot.nodes
    .filter(n => n.community === communityId)
    .map(n => n.id);
}

/**
 * Exports the graph to the GML (Graph Modeling Language) format.
 * 
 * @param graph - The graph to export.
 * @returns A GML-formatted string.
 */
export function exportToGML(graph: DirectedGraph): string {
  let gml = 'graph [\n  directed 1\n';
  
  graph.forEachNode((node, attributes) => {
    gml += `  node [\n    id "${node}"\n`;
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'string') {
        gml += `    ${key} "${value}"\n`;
      } else if (typeof value === 'number') {
        gml += `    ${key} ${value}\n`;
      }
    }
    gml += '  ]\n';
  });

  graph.forEachEdge((_edge, attributes, source, target) => {
    gml += `  edge [\n    source "${source}"\n    target "${target}"\n`;
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'string') {
        gml += `    ${key} "${value}"\n`;
      } else if (typeof value === 'number') {
        gml += `    ${key} ${value}\n`;
      }
    }
    gml += '  ]\n';
  });

  gml += ']';
  return gml;
}

/**
 * Exports the graph to the GraphML (XML-based) format.
 * 
 * @param graph - The graph to export.
 * @returns A GraphML-formatted XML string.
 */
export function exportToGraphML(graph: DirectedGraph): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
  
  // Define keys based on node attributes
  const nodeKeys = new Set<string>();
  graph.forEachNode((_, attrs) => Object.keys(attrs).forEach(k => nodeKeys.add(k)));
  nodeKeys.forEach(k => {
    xml += `  <key id="${k}" for="node" attr.name="${k}" attr.type="string"/>\n`;
  });

  const edgeKeys = new Set<string>();
  graph.forEachEdge((_, attrs) => Object.keys(attrs).forEach(k => edgeKeys.add(k)));
  edgeKeys.forEach(k => {
    xml += `  <key id="${k}" for="edge" attr.name="${k}" attr.type="string"/>\n`;
  });

  xml += '  <graph id="G" edgedefault="directed">\n';

  graph.forEachNode((node, attributes) => {
    xml += `    <node id="${node}">\n`;
    for (const [key, value] of Object.entries(attributes)) {
      xml += `      <data key="${key}">${value}</data>\n`;
    }
    xml += '    </node>\n';
  });

  graph.forEachEdge((_edge, attributes, source, target) => {
    xml += `    <edge id="${_edge}" source="${source}" target="${target}">\n`;
    for (const [key, value] of Object.entries(attributes)) {
      xml += `      <data key="${key}">${value}</data>\n`;
    }
    xml += '    </edge>\n';
  });

  xml += '  </graph>\n';
  xml += '</graphml>';
  return xml;
}

/**
 * Executes a simple graph traversal query using a pseudo-Cypher syntax.
 * 
 * @param graph - The graph to query.
 * @param query - The query string.
 * @returns Array of matching node IDs.
 * @throws Error if the query syntax is invalid or unsupported.
 * 
 * @example
 * ```ts
 * const dependents = queryGraph(graph, "MATCH (n)-[r:depends_on]->(m:src/cli.ts) RETURN n");
 * ```
 */
export function queryGraph(graph: DirectedGraph, query: string): string[] {
  const match = query.match(/MATCH\s+\((?<nodeVar>\w+)\)-\[r:(?<relation>.*)\]->\((?<targetVar>\w+):(?<targetId>.*)\)\s+RETURN\s+(?<returnVar>\w+)/);
  
  if (!match || !match.groups) {
    throw new Error('Invalid query syntax. Supported: MATCH (n)-[r:relation]->(m:ID) RETURN n');
  }

  const { relation, targetId, returnVar, nodeVar } = match.groups;

  if (returnVar !== nodeVar) {
    throw new Error('Only returning the source node variable is currently supported.');
  }

  if (!graph.hasNode(targetId)) {
    return [];
  }

  const results: string[] = [];
  graph.forEachInboundEdge(targetId, (_edge, attributes, source) => {
    if (attributes.relation === relation || relation === '*') {
      results.push(source);
    }
  });

  return results;
}

/**
 * Generates a human-readable Markdown report summarizing the graph analysis results.
 * 
 * @param result - The analysis result.
 * @returns A Markdown-formatted string.
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
