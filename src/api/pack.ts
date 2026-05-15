import { PackCommand } from '../commands/pack.js';
import type { ProjectSnapshot } from '../types/index.js';

export interface PackOptions {
  instruction?: string;
  summary?: string;
  maxSize?: number;
  outputStyle?: 'json' | 'markdown' | 'xml' | 'plain';
  branch?: string;
  commit?: string;
  compress?: boolean;
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  topFilesLength?: number;
  tokenLimit?: number;
  includeBinaries?: boolean;
  maxBinarySize?: number;
  semantic?: boolean;
  onProgress?: (message: string) => void;
}

/**
 * Programmatically create a codebase snapshot
 */
export async function pack(targetDir: string = '.', options: PackOptions = {}): Promise<ProjectSnapshot> {
  try {
    const cmd = new PackCommand();
    const args: string[] = [targetDir];
    
    if (options.instruction) args.push('--instruction', options.instruction);
    if (options.summary) args.push('--summary', options.summary);
    if (options.maxSize) args.push('--max-size', options.maxSize.toString());
    if (options.outputStyle) args.push('--output-style', options.outputStyle);
    if (options.branch) args.push('--branch', options.branch);
    if (options.commit) args.push('--commit', options.commit);
    if (options.compress) args.push('--compress');
    if (options.removeComments) args.push('--remove-comments');
    if (options.removeEmptyLines) args.push('--remove-empty-lines');
    if (options.topFilesLength) args.push('--top-files-length', options.topFilesLength.toString());
    if (options.tokenLimit) args.push('--token-limit', options.tokenLimit.toString());
    if (options.includeBinaries) args.push('--include-binaries');
    if (options.maxBinarySize) args.push('--max-binary-size', options.maxBinarySize.toString());
    if (options.semantic) args.push('--semantic');

    const outputHandler = (data: string) => {
      if (options.onProgress) {
        options.onProgress(data);
      }
    };

    const result = await cmd.execute(
      args, 
      { silent: true, json: true }, 
      { stdin: '', stdinIsPipe: false, outputHandler }
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Pack failed');
    }

    return result.data as ProjectSnapshot;
  } catch (err) {
    throw err;
  }
}
