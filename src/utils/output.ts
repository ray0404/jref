/**
 * @module Output
 * Centralized CLI output and formatting hub.
 * Handles the display of information, errors, and progress indicators across the jref CLI.
 * 
 * Features:
 * - Support for ANSI color formatting (human-readable mode).
 * - Automatic conversion to JSON format when `--json` is active.
 * - Suppressed formatting and decorative elements when `--raw` or `--silent` are active.
 * - Pluggable output handlers for redirection and testing.
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
 * Type definition for a custom output handler.
 * Used to redirect CLI output to streams, files, or state managers.
 */
export type OutputHandler = (data: string, type: 'stdout' | 'stderr') => void;

/**
 * Formats data based on the provided CLI options.
 * Prioritizes JSON output, then raw/silent strings, then human-readable blocks.
 * 
 * @param data - The data payload to format.
 * @param options - CLI configuration options.
 * @returns A formatted string ready for display.
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
 * Configures a custom global output handler.
 * This handler will be used by all print functions unless overridden locally.
 * 
 * @param handler - The handler function to set, or null to revert to default console.
 * @returns The previously configured handler.
 */
export function setOutputHandler(handler: OutputHandler | null): OutputHandler | null {
  const previous = globalOutputHandler;
  globalOutputHandler = handler;
  return previous;
}

/**
 * Resolves which output handler to use (local override or global default).
 * 
 * @param handler - Optional local override handler.
 * @returns The resolved handler or null if defaults should be used.
 */
function resolveHandler(handler?: OutputHandler | null): OutputHandler | null {
  return handler || globalOutputHandler;
}

/**
 * Prints data to the appropriate output stream using formatting logic.
 * 
 * @param data - Data to print.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints an error message to stderr.
 * In human mode, adds a red "Error:" prefix.
 * In JSON mode, outputs a structured error object.
 * 
 * @param message - The error message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints a success message.
 * In human mode, adds a green checkmark prefix.
 * 
 * @param message - The success message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints raw result text without decorative symbols.
 * Useful for piping data or emitting specific status messages.
 * 
 * @param message - The result message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints a warning message.
 * In human mode, adds a yellow warning symbol prefix.
 * 
 * @param message - The warning message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints an informational message.
 * In human mode, adds a cyan info symbol prefix.
 * 
 * @param message - The information message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Displays data in a formatted table.
 * Falls back to tab-separated values in raw/silent mode.
 * 
 * @param headers - Column headers.
 * @param rows - 2D array of strings representing row data.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints a progress message.
 * Automatically suppressed in raw, silent, or JSON modes.
 * 
 * @param message - Progress update message.
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
 * Prints the jref ASCII art header.
 * Suppressed in non-human modes.
 * 
 * @param options - CLI options.
 * @param handler - Optional local output handler override.
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
  write(`${RESET}${DIM}JSON Reference CLI - v1.1.0${RESET}`);
  write('');
}

/**
 * Gracefully terminates the process, ensuring all pending output streams are flushed.
 * This is critical when piping CLI output to other tools.
 * 
 * @param code - The exit code (0 for success, non-zero for error).
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

/**
 * Bundled output utilities for easier programmatic consumption.
 */
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
