import { ValidateCommand } from '../commands/validate.js';
import { GitCommand } from '../commands/git.js';

export interface ValidateOptions {
  includeDiffs?: boolean;
  includeLogs?: boolean;
  logsCount?: number;
}

/**
 * Programmatically validate a project directory or snapshot against a git target
 */
export async function validate(
  targetBranch: string,
  options: ValidateOptions = {}
): Promise<any> {
  const cmd = new ValidateCommand();
  const args: string[] = [targetBranch];
  
  if (options.includeDiffs) args.push('--include-diffs');
  if (options.includeLogs) args.push('--include-logs');
  if (options.logsCount) args.push('--logs-count', options.logsCount.toString());

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { 
      stdin: '', 
      stdinIsPipe: false,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Validation failed');
  return result.data;
}

export interface GitOptions {
  branch?: string;
  depth?: number;
  blastRadius?: string;
}

/**
 * Programmatically perform git-aware analysis on a project
 */
export async function gitAnalyze(
  options: GitOptions = {}
): Promise<any> {
  const cmd = new GitCommand();
  const args: string[] = [];
  
  if (options.branch) args.push('--branch', options.branch);
  if (options.depth) args.push('--depth', options.depth.toString());
  if (options.blastRadius) args.push('--blast-radius', options.blastRadius);

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { 
      stdin: '', 
      stdinIsPipe: false,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Git analysis failed');
  return result.data;
}
