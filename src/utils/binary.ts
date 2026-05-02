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

/**
 * Extract magic numbers (first 16 bytes) from a Base64 string without full decoding.
 */
export function getMagicNumbers(content: string): Buffer {
  // We only need the first 16 bytes. 
  // Base64 encoding uses 4 characters for every 3 bytes.
  // 16 bytes * (4/3) = 21.33 chars. Taking first 32 chars is safe.
  const preview = content.slice(0, 32);
  return Buffer.from(preview, 'base64').slice(0, 16);
}

/**
 * Detect MIME type from magic numbers.
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
