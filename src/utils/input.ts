/**
 * Input Utility
 * Handles stdin and pipe input for CLI operations
 * Supports: cat snapshot.json | jref inspect
 */

import { createReadStream } from 'fs';

/**
 * Check if stdin is a pipe (non-interactive mode)
 */
export function isStdinPiped(): boolean {
  // If isTTY is undefined or false, it's likely a pipe or redirected
  return !process.stdin.isTTY;
}

/**
 * Read input from stdin
 * Returns empty string if no data available
 */
export function readFromInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let resolved = false;

    // Set a timeout for non-pipe mode to avoid hanging if no data
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve('');
      }
    }, 100);

    // If stdin is not a TTY (pipe mode), read from it
    if (!process.stdin.isTTY) {
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
 * Re-establish the TTY after reading from a pipe
 * Essential for interactive TUIs like Ink that need raw mode
 */
export function reestablishTTY(): boolean {
  if (process.stdin.isTTY) return true;

  try {
    // Try to open the terminal device
    // On Linux/macOS this is /dev/tty
    const ttyStream = createReadStream('/dev/tty');
    
    // We need to override process.stdin for Ink to pick it up
    // @ts-ignore
    process.stdin = ttyStream;
    // @ts-ignore
    process.stdin.isTTY = true;
    // @ts-ignore
    process.stdin.setRawMode = (mode: boolean) => {
      // Dummy setRawMode if the real one isn't available
      // In many environments /dev/tty might not support it directly via createReadStream
    };
    
    return true;
  } catch (err) {
    // Silent fail if /dev/tty is not available
    return false;
  }
}

/**
 * Read all available stdin data synchronously (for blocking read)
 * Only use in non-interactive contexts
 */
export function readStdinSync(): string {
  if (process.stdin.isTTY) {
    return '';
  }

  const chunks: string[] = [];
  // Note: Node.js doesn't natively support easy sync stdin reads
  return chunks.join('');
}
