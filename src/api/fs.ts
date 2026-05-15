import { ExtractCommand } from '../commands/extract.js';
import { DiffCommand } from '../commands/diff.js';
import { ReconstructCommand } from '../commands/reconstruct.js';
import { BPackCommand } from '../commands/bpack.js';
import { BExtractCommand } from '../commands/bextract.js';
import type { ProjectSnapshot } from '../types/index.js';

export interface ExtractOptions {
  paths?: string[];
  outputDir?: string;
  flat?: boolean;
  dryRun?: boolean;
}

/**
 * Programmatically extract files from a snapshot
 */
export async function extract(
  snapshot: ProjectSnapshot | string,
  options: ExtractOptions = {}
): Promise<any> {
  const cmd = new ExtractCommand();
  const args: string[] = [];
  
  if (options.paths) args.push('--paths', options.paths.join(','));
  if (options.outputDir) args.push('--output', options.outputDir);
  if (options.flat) args.push('--flat');
  if (options.dryRun) args.push('--dry-run');

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
  
  if (!result.success) throw new Error(result.error || 'Extract failed');
  return result.data;
}

/**
 * Programmatically diff a snapshot against local files
 */
export async function diff(
  snapshot: ProjectSnapshot | string,
  targetDir: string = '.'
): Promise<any> {
  const cmd = new DiffCommand();
  const args: string[] = [targetDir];

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
  
  if (!result.success) throw new Error(result.error || 'Diff failed');
  return result.data;
}

/**
 * Programmatically reconstruct/verify local files from a snapshot
 */
export async function reconstruct(
  snapshot: ProjectSnapshot | string,
  targetDir: string = '.'
): Promise<any> {
  const cmd = new ReconstructCommand();
  const args: string[] = ['--directory', targetDir];

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
  
  if (!result.success) throw new Error(result.error || 'Reconstruct failed');
  return result.data;
}

export interface BPackOptions {
  exclude?: string[];
  maxBinarySize?: number;
}

/**
 * Programmatically archive a directory into a JSON snapshot (binary optimized)
 */
export async function bpack(
  targetDir: string = '.',
  options: BPackOptions = {}
): Promise<ProjectSnapshot> {
  const cmd = new BPackCommand();
  const args: string[] = [targetDir];

  if (options.exclude) {
    for (const pattern of options.exclude) {
      args.push('--exclude', pattern);
    }
  }
  if (options.maxBinarySize) args.push('--max-binary-size', options.maxBinarySize.toString());

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { stdin: '', stdinIsPipe: false, outputHandler: () => {} }
  );
  
  if (!result.success) throw new Error(result.error || 'BPack failed');
  return result.data as ProjectSnapshot;
}

/**
 * Programmatically extract files from a binary-optimized snapshot
 */
export async function bextract(
  snapshot: ProjectSnapshot | string,
  outputDir: string = '.'
): Promise<any> {
  const cmd = new BExtractCommand();
  const args: string[] = ['--output', outputDir];

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
  
  if (!result.success) throw new Error(result.error || 'BExtract failed');
  return result.data;
}
