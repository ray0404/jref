import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatOutput, printOutput, printError, printSuccess, printWarning, printInfo, printTable, printProgress, printHeader, exit as e } from './output.js';

describe('Output Utilities', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatOutput', () => {
    it('should format as JSON when --json flag is provided', () => {
      const data = { key: 'value' };
      expect(formatOutput(data, { json: true })).toBe(JSON.stringify(data, null, 2));
    });

    it('should format raw strings correctly in raw/silent mode', () => {
      expect(formatOutput('raw string', { raw: true })).toBe('raw string');
      expect(formatOutput('silent string', { silent: true })).toBe('silent string');
    });

    it('should stringify objects in raw/silent mode', () => {
      const data = { key: 'value' };
      expect(formatOutput(data, { raw: true })).toBe(JSON.stringify(data));
      expect(formatOutput(data, { silent: true })).toBe(JSON.stringify(data));
    });

    it('should return human-readable strings directly', () => {
      expect(formatOutput('human string', {})).toBe('human string');
    });

    it('should stringify objects for human-readable mode', () => {
      const data = { key: 'value' };
      expect(formatOutput(data, {})).toBe(JSON.stringify(data, null, 2));
    });
  });

  describe('printOutput', () => {
    it('should print formatted output to console.log', () => {
      printOutput('test message', { raw: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });
  });

  describe('printError', () => {
    it('should print JSON error when --json flag is true', () => {
      printError('test error', { json: true });
      expect(consoleErrorSpy).toHaveBeenCalledWith(JSON.stringify({ error: 'test error' }));
    });

    it('should print formatted error in normal mode', () => {
      printError('test error', {});
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('test error'));
    });

    it('should print plain error in silent/raw mode', () => {
      printError('test error', { raw: true });
      expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    });
  });

  describe('printSuccess', () => {
    it('should print JSON success when --json flag is true', () => {
      printSuccess('test success', { json: true });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ success: true, message: 'test success' }));
    });

    it('should print formatted success in normal mode', () => {
      printSuccess('test success', {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test success'));
    });

    it('should print plain success in silent/raw mode', () => {
      printSuccess('test success', { raw: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('test success');
    });
  });

  describe('printWarning', () => {
    it('should print JSON warning when --json flag is true', () => {
      printWarning('test warning', { json: true });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ warning: 'test warning' }));
    });

    it('should print formatted warning in normal mode', () => {
      printWarning('test warning', {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test warning'));
    });

    it('should print plain warning in silent/raw mode', () => {
      printWarning('test warning', { raw: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('test warning');
    });
  });

  describe('printInfo', () => {
    it('should print JSON info when --json flag is true', () => {
      printInfo('test info', { json: true });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ info: 'test info' }));
    });

    it('should print formatted info in normal mode', () => {
      printInfo('test info', {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test info'));
    });

    it('should print plain info in silent/raw mode', () => {
      printInfo('test info', { raw: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('test info');
    });
  });

  describe('printTable', () => {
    const headers = ['A', 'B'];
    const rows = [['1', '2'], ['3', '4']];

    it('should print JSON when --json flag is true', () => {
      printTable(headers, rows, { json: true });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ headers, rows }));
    });

    it('should print tab-separated values in raw/silent mode', () => {
      printTable(headers, rows, { raw: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('1\t2');
      expect(consoleLogSpy).toHaveBeenCalledWith('3\t4');
    });

    it('should handle undefined/empty cells in table rows', () => {
      printTable(['A', 'B'], [['1', ''], [undefined as any, '4']], {});
      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy.mock.calls[0][0]).toContain('A  B');
      expect(consoleLogSpy.mock.calls[2][0]).toContain('1   '); // Length of B padded to 1
    });

    it('should print formatted table in normal mode', () => {
      printTable(headers, rows, {});
      // Header, separator, and 2 rows
      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy.mock.calls[0][0]).toContain('A  B');
      expect(consoleLogSpy.mock.calls[1][0]).toContain('-  -');
      expect(consoleLogSpy.mock.calls[2][0]).toContain('1  2');
      expect(consoleLogSpy.mock.calls[3][0]).toContain('3  4');
    });
  });

  describe('printProgress', () => {
    it('should not print in silent/raw mode', () => {
      printProgress('test progress', { raw: true });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should print formatted progress in normal mode', () => {
      printProgress('test progress', {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test progress'));
    });
  });

  describe('printHeader', () => {
    it('should not print in silent/raw mode', () => {
      printHeader({ silent: true });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should print ASCII art header in normal mode', () => {
      printHeader({});
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[7][0]).toContain('JSON Reference CLI');
    });
  });

  describe('exit', () => {
    it('should call process.exit with the given code', () => {
      e(42);
      expect(processExitSpy).toHaveBeenCalledWith(42);
    });
  });
});
