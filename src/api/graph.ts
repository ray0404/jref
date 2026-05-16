/**
 * @module API/Graph
 * Programmatic interface for knowledge graph construction and analysis.
 */

import { GraphCommand } from '../commands/graph.js';
import { TopologyCommand } from '../commands/topology.js';
import type { GraphSnapshot, ProjectSnapshot } from '../types/index.js';

/**
 * Configuration options for the `buildGraph` function.
 */
export interface GraphBuildOptions {
  /**
   * Path to save the generated graph snapshot.
   */
  output?: string;
  /**
   * Whether to skip LLM-based inference for edge detection (AST only).
   */
  noLlm?: boolean;
  /**
   * Export format for the graph data.
   */
  format?: 'json' | 'gml' | 'graphml';
}

/**
 * Programmatically builds a knowledge graph from a local directory or a ProjectSnapshot.
 * Maps symbols, dependencies, and logical communities.
 * 
 * @param target - The target directory path or an existing ProjectSnapshot object.
 * @param options - Configuration options for the graph build.
 * @returns A promise resolving to the generated GraphSnapshot.
 * @throws Error if the graph construction fails.
 * 
 * @example
 * ```ts
 * import { buildGraph } from 'jref';
 * 
 * const graph = await buildGraph('./src', { format: 'json' });
 * ```
 */
export async function buildGraph(target: string | ProjectSnapshot, options: GraphBuildOptions = {}): Promise<GraphSnapshot> {
  try {
    const cmd = new GraphCommand();
    const args: string[] = ['build'];
    
    if (options.output) args.push('--output', options.output);
    if (options.noLlm) args.push('--no-llm');
    if (options.format) args.push('--format', options.format);

    let contextStdin = '';
    let targetPath: string | undefined;

    if (typeof target === 'string') {
      targetPath = target;
      args.push(targetPath);
    } else {
      contextStdin = JSON.stringify(target);
    }

    const result = await cmd.execute(
      args, 
      { silent: true, json: true }, 
      { 
        stdin: contextStdin, 
        stdinIsPipe: !!contextStdin,
        snapshot: typeof target === 'object' ? target : undefined,
        outputHandler: () => {} // Suppress all output
      }
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Graph build failed');
    }

    return result.data as GraphSnapshot;
  } catch (err) {
    throw err;
  }
}

/**
 * Programmatically executes a traversal query against a knowledge graph.
 * 
 * @param queryStr - The graph traversal query (pseudo-Cypher syntax).
 * @param graphFile - Path to the graph snapshot JSON file.
 * @returns A promise resolving to the query results.
 * @throws Error if the query fails or the graph file is missing.
 */
export async function queryGraph(queryStr: string, graphFile: string = 'graph-snapshot.json'): Promise<any> {
  try {
    const cmd = new GraphCommand();
    const args: string[] = ['query', queryStr, '--output', graphFile];

    const result = await cmd.execute(
      args, 
      { silent: true, json: true }, 
      { 
        stdin: '', 
        stdinIsPipe: false,
        outputHandler: () => {} // Suppress all output
      }
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Graph query failed');
    }

    return result.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Programmatically analyzes architectural drift and topological changes between two snapshots.
 * Useful for monitoring how a codebase structure evolves over time.
 * 
 * @param snapshotA - Path to the baseline snapshot file.
 * @param snapshotB - Path to the target snapshot file.
 * @returns A promise resolving to the topological analysis results.
 * @throws Error if the analysis fails.
 */
export async function topology(snapshotA: string, snapshotB: string): Promise<any> {
  const cmd = new TopologyCommand();
  const args: string[] = [snapshotA, snapshotB];

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { stdin: '', stdinIsPipe: false, outputHandler: () => {} }
  );
  
  if (!result.success) throw new Error(result.error || 'Topology analysis failed');
  return result.data;
}
