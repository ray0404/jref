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

/**
 * Print output to console with formatting
 */
export function printOutput(
  data: unknown,
  options: CLIOptions = {}
): void {
  const formatted = formatOutput(data, options);
  console.log(formatted);
}

/**
 * Print error to stderr
 */
export function printError(message: string, options: CLIOptions = {}): void {
  if (options.json) {
    console.error(JSON.stringify({ error: message }));
  } else if (!options.silent && !options.raw) {
    console.error(`${RED}Error:${RESET} ${message}`);
  } else {
    console.error(message);
  }
}

/**
 * Print success message
 */
export function printSuccess(message: string, options: CLIOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ success: true, message }));
  } else if (!options.silent && !options.raw) {
    console.log(`${GREEN}✓${RESET} ${message}`);
  } else {
    console.log(message);
  }
}

/**
 * Print warning message
 */
export function printWarning(message: string, options: CLIOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ warning: message }));
  } else if (!options.silent && !options.raw) {
    console.log(`${YELLOW}⚠${RESET} ${message}`);
  } else {
    console.log(message);
  }
}

/**
 * Print info message
 */
export function printInfo(message: string, options: CLIOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ info: message }));
  } else if (!options.silent && !options.raw) {
    console.log(`${CYAN}ℹ${RESET} ${message}`);
  } else {
    console.log(message);
  }
}

/**
 * Print formatted table (human mode only)
 */
export function printTable(
  headers: string[],
  rows: string[][],
  options: CLIOptions = {}
): void {
  if (options.json) {
    console.log(JSON.stringify({ headers, rows }));
    return;
  }

  if (options.silent || options.raw) {
    // In silent/raw mode, just output tab-separated
    for (const row of rows) {
      console.log(row.join('\t'));
    }
    return;
  }

  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length))
  );

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(BOLD + headerRow + RESET);
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));

  // Print rows
  for (const row of rows) {
    console.log(
      row.map((cell, i) => (cell || '').padEnd(widths[i])).join('  ')
    );
  }
}

/**
 * Print progress indicator (hidden in silent/raw mode)
 */
export function printProgress(
  message: string,
  options: CLIOptions = {}
): void {
  if (options.silent || options.raw) {
    return;
  }
  console.log(`${DIM}${message}${RESET}`);
}

/**
 * Print ASCII art header (hidden in silent/raw mode)
 */
export function printHeader(options: CLIOptions = {}): void {
  if (options.silent || options.raw) {
    return;
  }

  console.log(`${BOLD}${CYAN}`);
  console.log('  ██╗     ██╗   ██╗███████╗███████╗██╗  ██╗');
  console.log('  ██║     ██║   ██║██╔════╝██╔════╝╚██╗██╔╝');
  console.log('  ██║     ██║   ██║█████╗  █████╗   ╚███╔╝ ');
  console.log('  ██║     ██║   ██║██╔══╝  ██╔══╝   ██╔██╗ ');
  console.log('  ███████╗╚██████╔╝██║     ███████╗██╔╝ ██╗');
  console.log('  ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝');
  console.log(`${RESET}${DIM}JSON Reference CLI - v1.2.0${RESET}`);
  console.log();
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
