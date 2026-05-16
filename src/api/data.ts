/**
 * @module API/Data
 * Programmatic interface for deep data inspection and manipulation within snapshots.
 * Allows retrieval and modification of nested properties using dot-notation paths.
 */

import { GetCommand } from '../commands/get.js';
import { SetCommand } from '../commands/set.js';
import { InspectCommand } from '../commands/inspect.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Programmatically retrieves a nested property from a snapshot using a dot-notation path.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @param path - Dot-notation path to the property (e.g., "files.src/index.ts").
 * @returns A promise resolving to the property value.
 * @throws Error if the retrieval fails or the path is invalid.
 * 
 * @example
 * ```ts
 * const instruction = await get(mySnapshot, "instruction");
 * ```
 */
export async function get(
  snapshot: ProjectSnapshot | string,
  path: string
): Promise<any> {
  const cmd = new GetCommand();
  const args: string[] = [path];

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
  
  if (!result.success) throw new Error(result.error || 'Get failed');
  return result.data;
}

/**
 * Programmatically updates a nested property within a snapshot.
 * Returns a new snapshot object with the change applied.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @param path - Dot-notation path to the property.
 * @param value - The new value to set.
 * @returns A promise resolving to the updated ProjectSnapshot.
 * @throws Error if the update fails.
 */
export async function set(
  snapshot: ProjectSnapshot | string,
  path: string,
  value: any
): Promise<ProjectSnapshot> {
  const cmd = new SetCommand();
  const args: string[] = [path, JSON.stringify(value)];

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
  
  if (!result.success) throw new Error(result.error || 'Set failed');
  return result.data as ProjectSnapshot;
}

/**
 * Configuration options for the `inspect` function.
 */
export interface InspectOptions {
  /**
   * Whether to include quantitative metadata (file count, size).
   */
  metadata?: boolean;
  /**
   * Whether to include the directory structure tree.
   */
  structure?: boolean;
  /**
   * Whether to list all files present in the snapshot.
   */
  files?: boolean;
  /**
   * Whether to generate a high-level summary of snapshot content.
   */
  summary?: boolean;
}

/**
 * Programmatically inspects a snapshot to retrieve metadata and structural information.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @param options - Configuration options for the inspection.
 * @returns A promise resolving to the inspection data.
 * @throws Error if the inspection fails.
 */
export async function inspect(
  snapshot: ProjectSnapshot | string,
  options: InspectOptions = {}
): Promise<any> {
  const cmd = new InspectCommand();
  const args: string[] = [];
  
  if (options.metadata) args.push('--metadata');
  if (options.structure) args.push('--structure');
  if (options.files) args.push('--files');
  if (options.summary) args.push('--summary');

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
  
  if (!result.success) throw new Error(result.error || 'Inspect failed');
  return result.data;
}
