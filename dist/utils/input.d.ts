/**
 * Input Utility
 * Handles stdin and pipe input for CLI operations
 * Supports: cat snapshot.json | jref inspect
 */
/**
 * Check if stdin is a pipe (non-interactive mode)
 */
export declare function isStdinPiped(): boolean;
/**
 * Read input from stdin
 * Returns empty string if no data available
 */
export declare function readFromInput(): Promise<string>;
/**
 * Re-establish the TTY after reading from a pipe
 * Essential for interactive TUIs like Ink that need raw mode
 */
export declare function reestablishTTY(): boolean;
/**
 * Read all available stdin data synchronously (for blocking read)
 * Only use in non-interactive contexts
 */
export declare function readStdinSync(): string;
//# sourceMappingURL=input.d.ts.map