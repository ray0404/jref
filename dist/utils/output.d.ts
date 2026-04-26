/**
 * Output Utility
 * Handles CLI output formatting with support for --json and --silent/--raw flags
 * Ensures AI agent compatibility with --raw flag preventing progress/art output
 */
import type { CLIOptions } from '../types/index.js';
/**
 * Format output based on CLI options
 */
export declare function formatOutput(data: unknown, options: CLIOptions): string;
/**
 * Print output to console with formatting
 */
export declare function printOutput(data: unknown, options?: CLIOptions): void;
/**
 * Print error to stderr
 */
export declare function printError(message: string, options?: CLIOptions): void;
/**
 * Print success message
 */
export declare function printSuccess(message: string, options?: CLIOptions): void;
/**
 * Print warning message
 */
export declare function printWarning(message: string, options?: CLIOptions): void;
/**
 * Print info message
 */
export declare function printInfo(message: string, options?: CLIOptions): void;
/**
 * Print formatted table (human mode only)
 */
export declare function printTable(headers: string[], rows: string[][], options?: CLIOptions): void;
/**
 * Print progress indicator (hidden in silent/raw mode)
 */
export declare function printProgress(message: string, options?: CLIOptions): void;
/**
 * Print ASCII art header (hidden in silent/raw mode)
 */
export declare function printHeader(options?: CLIOptions): void;
/**
 * Exit with code
 */
export declare function exit(code: number): never;
//# sourceMappingURL=output.d.ts.map