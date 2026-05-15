import { QueryCommand } from '../commands/query.js';
import type { ProjectSnapshot } from '../types/index.js';

export interface QueryOptions {
  path?: string;
  semantic?: string;
  topK?: number;
  lineStart?: number;
  lineEnd?: number;
  searchBinaries?: boolean;
}

/**
 * Programmatically query a snapshot
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
