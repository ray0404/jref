/**
 * @module API/Execution
 * Programmatic interface for code execution and tool orchestration.
 * Enables running scripts directly from snapshots, invoking specialized binary snapshots,
 * and integrating external system tools with automated output parsing.
 */

import { RunCommand } from '../commands/run.js';
import { BinCommand } from '../commands/bin.js';
import { ToolCommand } from '../commands/tool.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Configuration options for the `run` and `bin` functions.
 */
export interface RunOptions {
  /**
   * Command-line arguments to pass to the script.
   */
  args?: string[];
  /**
   * Environment variable overrides for the execution context.
   */
  env?: Record<string, string>;
}

/**
 * Programmatically executes a script contained within a ProjectSnapshot.
 * The script is executed in a virtualized environment or temporary workspace.
 * 
 * @param snapshot - The ProjectSnapshot object or path to a snapshot file.
 * @param scriptPath - Relative path to the script within the snapshot.
 * @param options - Execution options (args, env).
 * @returns A promise resolving to the script's output or result data.
 * @throws Error if the execution fails or the script is not found.
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
 * Programmatically executes a script from a "binary snapshot" stored in the jref bin path.
 * Binary snapshots are named snapshots containing reusable tools or setup scripts.
 * 
 * @param snapshotName - The name of the binary snapshot (e.g., "web-starter").
 * @param scriptPath - Path to the script within that snapshot.
 * @param options - Execution options.
 * @returns A promise resolving to the execution results.
 * @throws Error if the binary snapshot is missing or execution fails.
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

/**
 * Configuration options for the `tool` function.
 */
export interface ToolOptions {
  /**
   * Name of a registered parser to use for processing the command output.
   */
  parser?: string;
  /**
   * Whether to return raw command output without parsing.
   */
  raw?: boolean;
}

/**
 * Programmatically invokes a system command and optionally parses its output into JSON.
 * Integrates external CLI tools (like `ls`, `git`, or `docker`) into the jref workflow.
 * 
 * @param command - The system command to run.
 * @param commandArgs - Arguments for the system command.
 * @param options - Tool integration options.
 * @returns A promise resolving to the (potentially parsed) command output.
 * @throws Error if the command fails to execute.
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
