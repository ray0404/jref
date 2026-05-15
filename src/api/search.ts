import { SearchCommand } from '../commands/search.js';
import type { ProjectSnapshot, SearchResult } from '../types/index.js';

export interface SearchOptions {
  maxResults?: number;
  context?: number;
  caseSensitive?: boolean;
  isRegex?: boolean;
}

/**
 * Programmatically search a snapshot
 */
export async function search(
  snapshot: ProjectSnapshot | string,
  pattern: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const cmd = new SearchCommand();
  const args: string[] = [pattern];
  
  if (options.maxResults) args.push('--max-results', options.maxResults.toString());
  if (options.context) args.push('--context', options.context.toString());
  if (options.caseSensitive) args.push('--case-sensitive');
  if (options.isRegex) args.push('--regex');

  let contextStdin = '';
  let filePath: string | undefined;

  if (typeof snapshot === 'string') {
    filePath = snapshot;
    args.push(filePath);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) {
    throw new Error(result.error || 'Search failed');
  }

  return (result.data as { results: SearchResult[] }).results;
}
