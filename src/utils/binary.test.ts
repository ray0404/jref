import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { getMagicNumbers, detectMimeType, encodeBase64, isBinaryFile } from './binary.js';

vi.mock('fs');

describe('Binary Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('isBinaryFile', () => {
    it('should return false when readFileSync throws an error', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found or permission denied');
      });

      expect(isBinaryFile('non-existent-file.txt')).toBe(false);
      expect(fs.readFileSync).toHaveBeenCalledWith('non-existent-file.txt', { flag: 'r' });
    });

    it('should return true for binary content', () => {
      const buffer = Buffer.alloc(1024);
      buffer[0] = 0; // null byte indicates binary

      vi.mocked(fs.readFileSync).mockReturnValue(buffer);

      expect(isBinaryFile('image.png')).toBe(true);
      expect(fs.readFileSync).toHaveBeenCalledWith('image.png', { flag: 'r' });
    });

    it('should return false for text content', () => {
      const buffer = Buffer.from('console.log("Hello World");', 'utf8');

      vi.mocked(fs.readFileSync).mockReturnValue(buffer);

      expect(isBinaryFile('script.js')).toBe(false);
      expect(fs.readFileSync).toHaveBeenCalledWith('script.js', { flag: 'r' });
    });
  });


  describe('getMagicNumbers', () => {
    it('should extract first 16 bytes from base64 string', () => {
      const buffer = Buffer.alloc(32);
      for (let i = 0; i < 32; i++) buffer[i] = i;
      const base64 = encodeBase64(buffer);
      
      const magic = getMagicNumbers(base64);
      expect(magic.length).toBe(16);
      expect(magic[0]).toBe(0);
      expect(magic[15]).toBe(15);
    });
  });

  describe('detectMimeType', () => {
    it('should detect ELF binary', () => {
      const magic = Buffer.from([0x7F, 0x45, 0x4C, 0x46]);
      expect(detectMimeType(magic)).toBe('application/x-elf');
    });

    it('should detect WAV audio', () => {
      const magic = Buffer.from('RIFF....WAVE', 'utf8');
      // Hex: 52 49 46 46 (RIFF) and 57 41 56 45 (WAVE) at offset 8
      const buffer = Buffer.alloc(16);
      buffer.write('RIFF', 0);
      buffer.write('WAVE', 8);
      expect(detectMimeType(buffer)).toBe('audio/wav');
    });

    it('should detect PNG image', () => {
      const magic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(detectMimeType(magic)).toBe('image/png');
    });

    it('should return default for unknown magic', () => {
      const magic = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(detectMimeType(magic)).toBe('application/octet-stream');
    });
  });
});
