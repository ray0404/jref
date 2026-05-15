/**
 * Output Utility
 * Handles CLI output formatting with support for --json and --silent/--raw flags
 * Ensures AI agent compatibility with --raw flag preventing progress/art output
 */

import type { CLIOptions } from '../types/index.js';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

export type OutputHandler = (data: string, type: 'stdout' | 'stderr') => void;

/**
 * Format output based on CLI options
 */
export function formatOutput(
  data: unknown,
  options: CLIOptions
): string {
  // --json flag takes precedence
  if (options.json) {
    return JSON.stringify(data, null, 2);
  }

  // For raw/silent mode, return string representation only
  if (options.raw || options.silent) {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }

  // Human-readable output
  if (typeof data === 'string') {
    return data;
  }

  return JSON.stringify(data, null, 2);
}

let globalOutputHandler: OutputHandler | null = null;

/**
 * Set a custom output handler to redirect all prints
 * Returns the previous handler
 */
export function setOutputHandler(handler: OutputHandler | null): OutputHandler | null {
  const previous = globalOutputHandler;
  globalOutputHandler = handler;
  return previous;
}

/**
 * Resolve the appropriate output handler
 */
function resolveHandler(handler?: OutputHandler | null): OutputHandler | null {
  return handler || globalOutputHandler;
}

/**
 * Print output to console with formatting
 */
export function printOutput(
  data: unknown,
  options: CLIOptions = {},
  handler?: OutputHandler | null
): void {
  const formatted = formatOutput(data, options);
  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    console.log(formatted);
  }
}

/**
 * Print error to stderr
 */
export function printError(message: string, options: CLIOptions = {}, handler?: OutputHandler | null): void {
  let formatted = '';
  if (options.json) {
    formatted = JSON.stringify({ error: message });
  } else if (!options.silent && !options.raw) {
    formatted = `${RED}Error:${RESET} ${message}`;
  } else {
    formatted = message;
  }

  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stderr');
  } else {
    console.error(formatted);
  }
}

/**
 * Print success message
 */
export function printSuccess(message: string, options: CLIOptions = {}, handler?: OutputHandler | null): void {
  let formatted = '';
  if (options.json) {
    formatted = JSON.stringify({ success: true, message });
  } else if (!options.silent && !options.raw) {
    formatted = `${GREEN}✓${RESET} ${message}`;
  } else {
    formatted = message;
  }

  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    console.log(formatted);
  }
}

/**
 * Print result message (generic output)
 */
export function printResult(message: string, options: CLIOptions = {}, handler?: OutputHandler | null): void {
  if (options.silent || (options.json && !options.raw)) {
    return;
  }
  
  const formatted = message;
  const activeHandler = resolveHandler(handler);

  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    process.stdout.write(formatted + '\n');
  }
}

/**
 * Print warning message
 */
export function printWarning(message: string, options: CLIOptions = {}, handler?: OutputHandler | null): void {
  let formatted = '';
  if (options.json) {
    formatted = JSON.stringify({ warning: message });
  } else if (!options.silent && !options.raw) {
    formatted = `${YELLOW}⚠${RESET} ${message}`;
  } else {
    formatted = message;
  }

  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    console.log(formatted);
  }
}

/**
 * Print info message
 */
export function printInfo(message: string, options: CLIOptions = {}, handler?: OutputHandler | null): void {
  let formatted = '';
  if (options.json) {
    formatted = JSON.stringify({ info: message });
  } else if (!options.silent && !options.raw) {
    formatted = `${CYAN}ℹ${RESET} ${message}`;
  } else {
    formatted = message;
  }

  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    console.log(formatted);
  }
}

/**
 * Print formatted table (human mode only)
 */
export function printTable(
  headers: string[],
  rows: string[][],
  options: CLIOptions = {},
  handler?: OutputHandler | null
): void {
  if (options.json) {
    printOutput({ headers, rows }, options, handler);
    return;
  }

  const activeHandler = resolveHandler(handler);

  if (options.silent || options.raw) {
    // In silent/raw mode, just output tab-separated
    for (const row of rows) {
      if (activeHandler) {
        activeHandler(row.join('\t'), 'stdout');
      } else {
        console.log(row.join('\t'));
      }
    }
    return;
  }

  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length))
  );

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  if (activeHandler) {
    activeHandler(BOLD + headerRow + RESET, 'stdout');
    activeHandler(widths.map((w) => '-'.repeat(w)).join('  '), 'stdout');
  } else {
    console.log(BOLD + headerRow + RESET);
    console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  }

  // Print rows
  for (const row of rows) {
    const r = row.map((cell, i) => (cell || '').padEnd(widths[i])).join('  ');
    if (activeHandler) {
      activeHandler(r, 'stdout');
    } else {
      console.log(r);
    }
  }
}

/**
 * Print progress indicator (hidden in silent/raw mode)
 */
export function printProgress(
  message: string,
  options: CLIOptions = {},
  handler?: OutputHandler | null
): void {
  if (options.silent || options.raw) {
    return;
  }
  const formatted = `${DIM}${message}${RESET}`;
  const activeHandler = resolveHandler(handler);
  if (activeHandler) {
    activeHandler(formatted, 'stdout');
  } else {
    console.log(formatted);
  }
}

/**
 * Print ASCII art header (hidden in silent/raw mode)
 */
export function printHeader(options: CLIOptions = {}, handler?: OutputHandler | null): void {
  if (options.silent || options.raw) {
    return;
  }

  const activeHandler = resolveHandler(handler);
  const write = (text: string) => {
    if (activeHandler) {
      activeHandler(text, 'stdout');
    } else {
      console.log(text);
    }
  };

  write(`${BOLD}${CYAN}`);
  write('  ██╗     ██╗   ██╗███████╗███████╗██╗  ██╗');
  write('  ██║     ██║   ██║██╔════╝██╔════╝╚██╗██╔╝');
  write('  ██║     ██║   ██║█████╗  █████╗   ╚███╔╝ ');
  write('  ██║     ██║   ██║██╔══╝  ██╔══╝   ██╔██╗ ');
  write('  ███████╗╚██████╔╝██║     ███████╗██╔╝ ██╗');
  write('  ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝');
  write(`${RESET}${DIM}JSON Reference CLI - v1.0.0${RESET}`);
  write('');
}

/**
 * Exit with code
 * Ensures stdout is flushed before exiting (essential for pipes)
 */
export function exit(code: number): void {
  process.exitCode = code;
  
  // If stdout is not empty, wait for it to flush
  if (!process.stdout.writableLength) {
    process.exit(code);
  }

  process.stdout.once('drain', () => {
    process.exit(code);
  });
}

export const output = {
  print: printOutput,
  success: printSuccess,
  error: printError,
  warn: printWarning,
  info: printInfo,
  table: printTable,
  progress: printProgress,
  header: printHeader,
  format: formatOutput,
  exit: exit,
};

export default output;
