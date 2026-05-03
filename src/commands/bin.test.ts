import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BinCommand } from './bin.js';
import { RunCommand } from './run.js';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('./run.js');

describe('BinCommand', () => {
  let command: BinCommand;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new BinCommand();
  });

  it('should resolve snapshot from .jref/bin', async () => {
    const snapshotName = 'mytool';
    const scriptPath = 'main.js';

    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) => p.includes('mytool.json'));
    
    const executeSpy = vi.spyOn(RunCommand.prototype, 'execute').mockResolvedValue({ success: true, exitCode: 0 });

    const result = await command.execute([snapshotName, scriptPath], {}, { stdinIsPipe: false });

    expect(result.success).toBe(true);
    expect(executeSpy).toHaveBeenCalled();
    const callArgs = executeSpy.mock.calls[0][0];
    expect(callArgs).toContain('--path');
    expect(callArgs).toContain(scriptPath);
    expect(callArgs[2]).toMatch(/mytool\.json$/);
  });

  it('should resolve snapshot from $JREF_BIN_PATH', async () => {
    const snapshotName = 'custom-tool';
    const scriptPath = 'run.sh';
    const customBinPath = '/tmp/custom-bin';

    const originalBinPath = process.env.JREF_BIN_PATH;
    process.env.JREF_BIN_PATH = customBinPath;
    
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) => p.includes('custom-tool.jref'));
    
    const executeSpy = vi.spyOn(RunCommand.prototype, 'execute').mockResolvedValue({ success: true, exitCode: 0 });

    const result = await command.execute([snapshotName, scriptPath], {}, { stdinIsPipe: false });

    expect(result.success).toBe(true);
    expect(executeSpy).toHaveBeenCalled();
    const callArgs = executeSpy.mock.calls[0][0];
    expect(callArgs[2]).toMatch(/custom-tool\.jref$/);
    
    process.env.JREF_BIN_PATH = originalBinPath;
  });

  it('should handle argument isolation with --', async () => {
    const snapshotName = 'mytool';
    const scriptPath = 'main.js';

    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) => p.includes('mytool.json'));
    const executeSpy = vi.spyOn(RunCommand.prototype, 'execute').mockResolvedValue({ success: true, exitCode: 0 });

    await command.execute([snapshotName, scriptPath, '--', '--arg1', 'val1'], {}, { stdinIsPipe: false });

    expect(executeSpy).toHaveBeenCalled();
    const callArgs = executeSpy.mock.calls[0][0];
    expect(callArgs).toEqual(expect.arrayContaining(['--path', scriptPath, '--', '--arg1', 'val1']));
  });

  it('should return error if snapshot is not found', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    
    const result = await command.execute(['missing', 'script.js'], {}, { stdinIsPipe: false });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Snapshot not found');
  });
});
