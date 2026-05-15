import { GraphCommand } from '../commands/graph.js';
import type { GraphSnapshot, ProjectSnapshot } from '../types/index.js';

export interface GraphBuildOptions {
  output?: string;
  noLlm?: boolean;
  format?: 'json' | 'gml' | 'graphml';
}

/**
 * Programmatically build a knowledge graph
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
 * Programmatically query a knowledge graph
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
