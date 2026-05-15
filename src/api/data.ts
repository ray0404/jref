import { GetCommand } from '../commands/get.js';
import { SetCommand } from '../commands/set.js';
import { InspectCommand } from '../commands/inspect.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Programmatically get a deep property from a snapshot
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
 * Programmatically set a deep property in a snapshot
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

export interface InspectOptions {
  metadata?: boolean;
  structure?: boolean;
  files?: boolean;
  summary?: boolean;
}

/**
 * Programmatically inspect a snapshot
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
