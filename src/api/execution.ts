import { RunCommand } from '../commands/run.js';
import { BinCommand } from '../commands/bin.js';
import { ToolCommand } from '../commands/tool.js';
import type { ProjectSnapshot } from '../types/index.js';

export interface RunOptions {
  args?: string[];
  env?: Record<string, string>;
}

/**
 * Programmatically execute a script from a snapshot
 */
export async function run(
  snapshot: ProjectSnapshot | string,
  scriptPath: string,
  options: RunOptions = {}
): Promise<any> {
  const cmd = new RunCommand();
  const args: string[] = [scriptPath];
  
  if (options.args) {
    args.push('--', ...options.args);
  }

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
  
  if (!result.success) throw new Error(result.error || 'Run failed');
  return result.data;
}

/**
 * Programmatically execute a script from a named snapshot in $JREF_BIN_PATH
 */
export async function bin(
  snapshotName: string,
  scriptPath: string,
  options: RunOptions = {}
): Promise<any> {
  const cmd = new BinCommand();
  const args: string[] = [snapshotName, scriptPath];
  
  if (options.args) {
    args.push('--', ...options.args);
  }

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { 
      stdin: '', 
      stdinIsPipe: false,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Bin execution failed');
  return result.data;
}

export interface ToolOptions {
  parser?: string;
  raw?: boolean;
}

/**
 * Programmatically run a system command and parse its output
 */
export async function tool(
  command: string,
  commandArgs: string[] = [],
  options: ToolOptions = {}
): Promise<any> {
  const cmd = new ToolCommand();
  const args: string[] = [];
  
  if (options.parser) args.push('--parser', options.parser);
  if (options.raw) args.push('--raw');
  
  args.push(command, ...commandArgs);

  const result = await cmd.execute(
    args, 
    { silent: true, json: true }, 
    { 
      stdin: '', 
      stdinIsPipe: false,
      outputHandler: () => {}
    }
  );
  
  if (!result.success) throw new Error(result.error || 'Tool execution failed');
  return result.data;
}
