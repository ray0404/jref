/**
 * @module API/Query
 * Programmatic interface for querying project snapshots.
 */

import { QueryCommand } from '../commands/query.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Configuration options for the `query` function.
 */
export interface QueryOptions {
  /**
   * Specific file path to retrieve from the snapshot.
   */
  path?: string;
  /**
   * Semantic search query string.
   * If provided, the engine will perform a vector-based search across code chunks.
   */
  semantic?: string;
  /**
   * Number of results to return for semantic search (default: 5).
   */
  topK?: number;
  /**
   * Starting line number for targeted file extraction (1-based).
   */
  lineStart?: number;
  /**
   * Ending line number for targeted file extraction (inclusive).
   */
  lineEnd?: number;
  /**
   * Whether to include binary files in search results.
   */
  searchBinaries?: boolean;
}

/**
 * Programmatically queries a ProjectSnapshot or a snapshot file.
 * Supports targeted file retrieval, line-range extraction, and semantic search.
 * 
 * @param snapshot - The ProjectSnapshot object or a path to a snapshot JSON file.
 * @param options - Configuration options for the query.
 * @returns A promise resolving to the query result (file content, search results, or metadata).
 * @throws Error if the query fails or the snapshot is invalid.
 * 
 * @example
 * ```ts
 * import { query } from 'jref';
 * 
 * // Extract specific lines from a file in the snapshot
 * const content = await query(mySnapshot, {
 *   path: 'src/index.ts',
 *   lineStart: 1,
 *   lineEnd: 10
 * });
 * ```
 */
export async function query(snapshot: ProjectSnapshot | string, options: QueryOptions = {}): Promise<any> {
  try {
    const cmd = new QueryCommand();
    const args: string[] = [];
    
    if (options.path) args.push('--path', options.path);
    if (options.semantic) args.push('--semantic', options.semantic);
    if (options.topK) args.push('--top-k', options.topK.toString());
    if (options.lineStart) args.push('--line-start', options.lineStart.toString());
    if (options.lineEnd) args.push('--line-end', options.lineEnd.toString());
    if (options.searchBinaries) args.push('--search-binaries');

    let contextStdin = '';
    let filePath: string | undefined;

    if (typeof snapshot === 'string') {
      filePath = snapshot;
    } else {
      contextStdin = JSON.stringify(snapshot);
    }

    if (filePath) args.push(filePath);

    const result = await cmd.execute(
      args, 
      { silent: true, json: true }, 
      { 
        stdin: contextStdin, 
        stdinIsPipe: !!contextStdin,
        snapshot: typeof snapshot === 'object' ? snapshot : undefined,
        outputHandler: () => {} // Suppress all output for programmatic query
      }
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Query failed');
    }

    return result.data;
  } catch (err) {
    throw err;
  }
}
