/**
 * @module API/Pack
 * Programmatic interface for creating codebase snapshots.
 */

import { PackCommand } from '../commands/pack.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Configuration options for the `pack` function.
 */
export interface PackOptions {
  /**
   * Optional custom instruction for the AI agent to be embedded in the snapshot.
   */
  instruction?: string;
  /**
   * Optional summary of the project or specific focus area.
   */
  summary?: string;
  /**
   * Maximum size in bytes for the generated snapshot.
   */
  maxSize?: number;
  /**
   * Visual style of the output (only affects non-JSON formats).
   */
  outputStyle?: 'json' | 'markdown' | 'xml' | 'plain';
  /**
   * Target git branch to pack (defaults to current).
   */
  branch?: string;
  /**
   * Target git commit hash to pack.
   */
  commit?: string;
  /**
   * Whether to compress the snapshot output.
   */
  compress?: boolean;
  /**
   * Whether to strip comments from source code files.
   */
  removeComments?: boolean;
  /**
   * Whether to remove empty lines from source code files.
   */
  removeEmptyLines?: boolean;
  /**
   * Number of top files to include in the summary.
   */
  topFilesLength?: number;
  /**
   * Token limit for the snapshot (used for AI context management).
   */
  tokenLimit?: number;
  /**
   * Whether to include binary files (encoded as Base64).
   */
  includeBinaries?: boolean;
  /**
   * Maximum size in bytes for an individual binary file.
   */
  maxBinarySize?: number;
  /**
   * Whether to perform semantic analysis and generate code chunks.
   */
  semantic?: boolean;
  /**
   * Optional callback to receive progress updates during the packing process.
   * @param message - Progress message.
   */
  onProgress?: (message: string) => void;
}

/**
 * Programmatically generates a condensed JSON snapshot of a codebase.
 * This is the core engine used by the `jref pack` command.
 * 
 * @param targetDir - The root directory of the project to pack (defaults to current directory).
 * @param options - Configuration options for the packing process.
 * @returns A promise resolving to the generated ProjectSnapshot.
 * @throws Error if the packing process fails or the target directory is inaccessible.
 * 
 * @example
 * ```ts
 * import { pack } from 'jref';
 * 
 * const snapshot = await pack('./src', {
 *   instruction: "Analyze this TypeScript project.",
 *   compress: true
 * });
 * ```
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
