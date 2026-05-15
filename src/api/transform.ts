import { FlattenCommand } from '../commands/flatten.js';
import { UnflattenCommand } from '../commands/unflatten.js';
import { PatchCommand } from '../commands/patch.js';
import { SummarizeCommand } from '../commands/summarize.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Programmatically flatten a snapshot into a single file string
 */
export async function flatten(
  snapshot: ProjectSnapshot | string
): Promise<string> {
  const cmd = new FlattenCommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  const result = await cmd.execute(
    args, 
    { silent: true, raw: true }, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Flatten failed');
  return result.output || '';
}

/**
 * Programmatically unflatten a concatenated string back into a snapshot
 */
export async function unflatten(
  content: string
): Promise<ProjectSnapshot> {
  const cmd = new UnflattenCommand();
  
  const result = await cmd.execute(
    [], 
    { silent: true, json: true }, 
    { 
      stdin: content, 
      stdinIsPipe: true,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Unflatten failed');
  return result.data as ProjectSnapshot;
}

/**
 * Programmatically patch a snapshot with a diff or file map
 */
export async function patch(
  snapshot: ProjectSnapshot | string,
  patchData: string | object
): Promise<ProjectSnapshot> {
  const cmd = new PatchCommand();
  const patchFile = typeof patchData === 'string' ? patchData : JSON.stringify(patchData);
  
  const args: string[] = [patchFile];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
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
  
  if (!result.success) throw new Error(result.error || 'Patch failed');
  return result.data as ProjectSnapshot;
}

/**
 * Programmatically summarize a snapshot into a high-level map
 */
export async function summarize(
  snapshot: ProjectSnapshot | string
): Promise<any> {
  const cmd = new SummarizeCommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
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
  
  if (!result.success) throw new Error(result.error || 'Summarize failed');
  return result.data;
}
