/**
 * @module API/Transform
 * Programmatic interface for transforming and manipulating project snapshots.
 * Supports flattening/unflattening for alternative storage formats, patching for 
 * state updates, and generating architectural summaries.
 */

import { FlattenCommand } from '../commands/flatten.js';
import { UnflattenCommand } from '../commands/unflatten.js';
import { PatchCommand } from '../commands/patch.js';
import { SummarizeCommand } from '../commands/summarize.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Programmatically flattens a snapshot into a single concatenated string.
 * This is useful for passing codebase context to legacy AI models or storage systems
 * that do not support structured JSON.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @returns A promise resolving to the flattened string representation.
 * @throws Error if the flattening process fails.
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
 * Programmatically reconstructs a ProjectSnapshot from a flattened content string.
 * Reverses the logic applied by the `flatten` function.
 * 
 * @param content - The flattened codebase string.
 * @returns A promise resolving to the reconstructed ProjectSnapshot.
 * @throws Error if the reconstruction fails.
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
 * Programmatically applies a patch (diff or file map) to an existing snapshot.
 * This enables incremental updates to codebase state without full re-packing.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @param patchData - The patch content (JSON diff or file map object).
 * @returns A promise resolving to the updated ProjectSnapshot.
 * @throws Error if the patching process fails.
 * 
 * @example
 * ```ts
 * const updated = await patch(mySnapshot, { "src/index.ts": "new content" });
 * ```
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
 * Programmatically generates a high-level summary map of a snapshot.
 * The summary includes file signatures and interface outlines, optimized for 
 * architectural analysis and initial planning.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @returns A promise resolving to the summary data structure.
 * @throws Error if the summarization fails.
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
