import { spawn } from 'child_process';

export interface ToolResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  command: string;
  args: string[];
}

export interface ToolRunnerOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
}

/**
 * Execute a command and capture its output as a promise
 */
export async function runTool(
  command: string,
  args: string[] = [],
  options: ToolRunnerOptions = {}
): Promise<ToolResult> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: options.cwd,
      env: options.env || process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout!.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr!.on('data', (data) => {
      stderr += data.toString();
    });

    if (options.timeout) {
      const timer = setTimeout(() => {
        childProcess.kill();
        reject(new Error(`Command timed out after ${options.timeout}ms`));
      }, options.timeout);

      childProcess.on('exit', () => clearTimeout(timer));
    }

    childProcess.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code,
        command,
        args
      });
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Execute a command and return streams for stdout/stderr
 */
export function spawnTool(
  command: string,
  args: string[] = [],
  options: ToolRunnerOptions = {}
) {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    stdout: child.stdout,
    stderr: child.stderr,
    child
  };
}
