import { describe, it, expect } from 'vitest';
import { getMagicNumbers, detectMimeType, encodeBase64 } from './binary.js';

describe('Binary Utils', () => {
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
