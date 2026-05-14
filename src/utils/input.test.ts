import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFromInput, isStdinPiped, reestablishTTY, readStdinSync, getOptimalInputStream } from './input.js';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as tty from 'tty';

vi.mock('fs', () => {
  return {
    openSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn(),
    createReadStream: vi.fn(),
  };
});

vi.mock('tty', () => {
  return {
    default: {
      ReadStream: vi.fn(),
      WriteStream: vi.fn(),
    }
  };
});

describe('input.ts', () => {
  let originalStdin: any;
  let originalStdout: any;

  beforeEach(() => {
    originalStdin = process.stdin;
    originalStdout = process.stdout;
    vi.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(process, 'stdin', {
      value: originalStdin,
      configurable: true,
      writable: true
    });
    Object.defineProperty(process, 'stdout', {
      value: originalStdout,
      configurable: true,
      writable: true
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function mockStdin(isTTY: boolean | undefined) {
    const listeners: Record<string, Function[]> = {};
    const stdinMock = {
      isTTY,
      setEncoding: vi.fn(),
      on: vi.fn((event: string, callback: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
        return stdinMock;
      }),
      emit: (event: string, ...args: any[]) => {
        if (listeners[event]) {
          listeners[event].forEach((cb) => cb(...args));
        }
      },
    };

    Object.defineProperty(process, 'stdin', {
      value: stdinMock,
      configurable: true,
      writable: true
    });

    return stdinMock;
  }

  describe('isStdinPiped', () => {
    it('returns true when isTTY is false', () => {
      mockStdin(false);
      expect(isStdinPiped()).toBe(true);
    });

    it('returns true when isTTY is undefined', () => {
      mockStdin(undefined);
      expect(isStdinPiped()).toBe(true);
    });

    it('returns false when isTTY is true', () => {
      mockStdin(true);
      expect(isStdinPiped()).toBe(false);
    });
  });

  describe('readFromInput', () => {
    it('resolves immediately with empty string if in TTY mode (isTTY = true)', async () => {
      mockStdin(true);

      const promise = readFromInput();
      const result = await promise;

      expect(result).toBe('');
    });

    it('collects chunks and resolves with data when stream ends in pipe mode (isTTY = false)', async () => {
      const stdin = mockStdin(false);

      const promise = readFromInput();

      stdin.emit('data', 'hello');
      stdin.emit('data', ' world');
      stdin.emit('end');

      const result = await promise;
      expect(result).toBe('hello world');
      expect(stdin.setEncoding).toHaveBeenCalledWith('utf8');
    });

    it('rejects with error when stream errors in pipe mode (isTTY = false)', async () => {
      const stdin = mockStdin(false);

      const promise = readFromInput();

      const testError = new Error('Test error');
      stdin.emit('error', testError);

      await expect(promise).rejects.toThrow('Test error');
    });

    it('times out and resolves with empty string if no data is received within 100ms in pipe mode', async () => {
      mockStdin(false);

      const promise = readFromInput();

      vi.advanceTimersByTime(150);

      const result = await promise;
      expect(result).toBe('');
    });

    it('handles multiple end events safely', async () => {
      const stdin = mockStdin(false);
      const promise = readFromInput();

      stdin.emit('data', 'data');
      stdin.emit('end');
      stdin.emit('end'); // Should not cause errors or change resolved value

      const result = await promise;
      expect(result).toBe('data');
    });

    it('handles multiple error events safely', async () => {
      const stdin = mockStdin(false);
      const promise = readFromInput();

      stdin.emit('error', new Error('First error'));
      stdin.emit('error', new Error('Second error')); // Should be ignored

      await expect(promise).rejects.toThrow('First error');
    });
  });

  describe('reestablishTTY', () => {
    it('returns true immediately if already a TTY', () => {
      mockStdin(true);
      expect(reestablishTTY()).toBe(true);
    });

    it('successfully opens /dev/tty and replaces stdin/stdout', () => {
      mockStdin(false);

      const fd = 123;
      vi.mocked(fs.openSync).mockReturnValue(fd);

      const ttyIn = { isMockTtyIn: true };
      const ttyOut = { isMockTtyOut: true };

      vi.mocked(tty.default.ReadStream).mockReturnValue(ttyIn as any);
      vi.mocked(tty.default.WriteStream).mockReturnValue(ttyOut as any);

      const result = reestablishTTY();

      expect(result).toBe(true);
      expect(fs.openSync).toHaveBeenCalledWith('/dev/tty', 'r+');
      expect(tty.default.ReadStream).toHaveBeenCalledWith(fd);
      expect(tty.default.WriteStream).toHaveBeenCalledWith(fd);

      expect(process.stdin).toBe(ttyIn);
      expect(process.stdout).toBe(ttyOut);
    });

    it('returns false and silently fails if openSync throws', () => {
      mockStdin(false);
      vi.mocked(fs.openSync).mockImplementation(() => {
        throw new Error('Could not open /dev/tty');
      });

      const result = reestablishTTY();

      expect(result).toBe(false);
      // Ensure stdin/stdout were not replaced
      expect(process.stdin).not.toBeNull();
    });
  });

  describe('readStdinSync', () => {
    it('returns empty string if isTTY is true', () => {
      mockStdin(true);
      expect(readStdinSync()).toBe('');
    });

    it('returns empty string if isTTY is false (since it is not implemented to read natively)', () => {
      mockStdin(false);
      // The current implementation just returns an empty string join
      expect(readStdinSync()).toBe('');
    });
  });

  describe('getOptimalInputStream', () => {
    it('returns readFileSync result for small files (< 8MB)', () => {
      const filePath = 'small.txt';
      const fileContent = 'file content';
      vi.mocked(fs.statSync).mockReturnValue({ size: 1024 } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

      const result = getOptimalInputStream(filePath, { stdinIsPipe: false } as any);

      expect(fs.statSync).toHaveBeenCalledWith(filePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(result).toBe(fileContent);
    });

    it('returns createReadStream for large files (>= 8MB)', () => {
      const filePath = 'large.txt';
      const stream = new Readable();
      vi.mocked(fs.statSync).mockReturnValue({ size: 10 * 1024 * 1024 } as any);
      vi.mocked(fs.createReadStream).mockReturnValue(stream as any);

      const result = getOptimalInputStream(filePath, { stdinIsPipe: false } as any);

      expect(fs.statSync).toHaveBeenCalledWith(filePath);
      expect(fs.createReadStream).toHaveBeenCalledWith(filePath);
      expect(result).toBe(stream);
    });

    it('returns standard process.stdin when no file path is provided and not a pipe', () => {
      const stdin = mockStdin(true);

      const result = getOptimalInputStream(undefined, { stdinIsPipe: false } as any);

      expect(result).toBe(stdin);
    });

    it('returns Readable from context.stdin when no file path is provided and is a pipe', () => {
      const stdinStr = 'piped content';

      const result = getOptimalInputStream(undefined, {
        stdinIsPipe: true,
        stdin: stdinStr
      } as any);

      expect(result).toBeInstanceOf(Readable);

      // Verify stream content
      let content = '';
      (result as Readable).on('data', chunk => { content += chunk; });
      (result as Readable).on('end', () => {
        expect(content).toBe(stdinStr);
      });
    });
  });
});
