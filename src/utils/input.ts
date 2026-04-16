/**
 * Input Utility
 * Handles stdin and pipe input for CLI operations
 * Supports: cat snapshot.json | jref inspect
 */

/**
 * Check if stdin is a pipe (non-interactive mode)
 */
export function isStdinPiped(): boolean {
  return process.stdin.isTTY === undefined;
}

/**
 * Read input from stdin
 * Returns empty string if no data available
 */
export function readFromInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let resolved = false;

    // Set a timeout for non-pipe mode
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve('');
      }
    }, 100);

    // If stdin is not a TTY (pipe mode), read from it
    if (process.stdin.isTTY === undefined) {
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', (chunk: string) => {
        data += chunk;
      });

      process.stdin.on('end', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(data);
        }
      });

      process.stdin.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });
    } else {
      // Interactive mode - no pipe input
      clearTimeout(timeout);
      resolve('');
    }
  });
}

/**
 * Read all available stdin data synchronously (for blocking read)
 * Only use in non-interactive contexts
 */
export function readStdinSync(): string {
  if (process.stdin.isTTY !== undefined) {
    return '';
  }

  const chunks: string[] = [];

  // Note: This is a simplified sync read
  // In practice, Node.js doesn't support truly sync stdin reads
  // This is here for compatibility and will return empty in most cases
  return chunks.join('');
}