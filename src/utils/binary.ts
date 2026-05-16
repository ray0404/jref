/**
 * @module Binary
 * Utilities for binary data detection and encoding.
 * 
 * In the context of jref snapshots, binary detection is critical to ensure that
 * non-text files (e.g., images, executables, compiled archives) are correctly 
 * identified and encoded as Base64. This prevents JSON serialization errors 
 * and data corruption during "Packing" and "Extraction" workflows.
 */

import { readFileSync } from 'fs';

/**
 * Applies a heuristic to determine if a buffer contains binary data.
 * The heuristic scans the first 8KB of the buffer for null bytes (0x00).
 * 
 * @param buffer - The buffer to check.
 * @returns True if the buffer is likely binary.
 */
export function isBinaryBuffer(buffer: Buffer): boolean {
  const checkSize = Math.min(buffer.length, 8192);
  for (let i = 0; i < checkSize; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

/**
 * Checks if a file on disk is binary based on its content.
 * 
 * @param filePath - Path to the file to check.
 * @returns True if the file is binary.
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
 * Determines the appropriate encoding ('utf8' or 'base64') for a given buffer.
 * 
 * @param buffer - The data buffer.
 * @returns The encoding type to use for serialization.
 */
export function getFileEncoding(buffer: Buffer): 'utf8' | 'base64' {
  return isBinaryBuffer(buffer) ? 'base64' : 'utf8';
}

/**
 * Decodes a Base64 string into a Buffer.
 * 
 * @param content - The Base64 encoded string.
 * @returns A Buffer containing the raw decoded data.
 */
export function decodeBase64(content: string): Buffer {
  return Buffer.from(content, 'base64');
}

/**
 * Encodes a Buffer into a Base64 string.
 * 
 * @param buffer - The buffer to encode.
 * @returns A Base64 encoded string.
 */
export function encodeBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Extracts magic numbers (the first 16 bytes) from a Base64 encoded string.
 * This is performed without decoding the entire string, making it efficient 
 * for large binary assets.
 * 
 * @param content - The Base64 encoded string.
 * @returns A Buffer containing the first 16 bytes of the original data.
 */
export function getMagicNumbers(content: string): Buffer {
  // We only need the first 16 bytes. 
  // Base64 encoding uses 4 characters for every 3 bytes.
  // 16 bytes * (4/3) = 21.33 chars. Taking first 32 chars is safe.
  const preview = content.slice(0, 32);
  return Buffer.from(preview, 'base64').slice(0, 16);
}

/**
 * Detects the likely MIME type of a file based on its magic numbers.
 * Supports common executable, archive, image, and audio/video formats.
 * 
 * @param magic - A buffer containing at least the first 4-8 bytes of the file.
 * @returns The detected MIME type string, or 'application/octet-stream' as a fallback.
 */
export function detectMimeType(magic: Buffer): string {
  if (magic.length < 4) return 'application/octet-stream';

  // Common magic numbers
  const hex = magic.toString('hex').toUpperCase();

  // Executables
  if (hex.startsWith('7F454C46')) return 'application/x-elf'; // ELF
  if (hex.startsWith('4D5A')) return 'application/x-msdownload'; // MZ (EXE/DLL)
  if (hex.startsWith('CAFEBABE') || hex.startsWith('FEEDFACE') || hex.startsWith('FEEDFACF')) return 'application/x-mach-binary'; // Mach-O

  // Archives
  if (hex.startsWith('504B0304')) return 'application/zip';
  if (hex.startsWith('377ABCAF271C')) return 'application/x-7z-compressed';
  if (hex.startsWith('1F8B')) return 'application/gzip';
  if (hex.startsWith('425A68')) return 'application/x-bzip2';
  if (hex.startsWith('FD377A585A00')) return 'application/x-xz';

  // Images
  if (hex.startsWith('FFD8FF')) return 'image/jpeg';
  if (hex.startsWith('89504E470D0A1A0A')) return 'image/png';
  if (hex.startsWith('474946383761') || hex.startsWith('474946383961')) return 'image/gif';
  if (hex.startsWith('424D')) return 'image/bmp';
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return 'image/webp';

  // Audio/Video
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57415645') return 'audio/wav';
  if (hex.startsWith('494433') || hex.startsWith('FFF1') || hex.startsWith('FFF9')) return 'audio/mpeg';
  if (hex.startsWith('4F676753')) return 'audio/ogg';
  if (hex.startsWith('664C6143')) return 'audio/flac';

  return 'application/octet-stream';
}
