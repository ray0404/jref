import { readFileSync } from 'fs';

/**
 * Heuristic to check if a buffer contains binary data.
 * Checks for null bytes in the first 8KB of data.
 */
export function isBinaryBuffer(buffer: Buffer): boolean {
  const checkSize = Math.min(buffer.length, 8192);
  for (let i = 0; i < checkSize; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

/**
 * Checks if a file is binary based on its content.
 */
export function isBinaryFile(filePath: string): boolean {
  try {
    const buffer = readFileSync(filePath, { flag: 'r' });
    return isBinaryBuffer(buffer);
  } catch {
    return false;
  }
}

/**
 * Get file encoding for a given buffer.
 */
export function getFileEncoding(buffer: Buffer): 'utf8' | 'base64' {
  return isBinaryBuffer(buffer) ? 'base64' : 'utf8';
}

/**
 * Decode Base64 string to Buffer.
 */
export function decodeBase64(content: string): Buffer {
  return Buffer.from(content, 'base64');
}

/**
 * Encode Buffer to Base64 string.
 */
export function encodeBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
