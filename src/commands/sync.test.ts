import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PackCommand } from './pack.js';
import { ExtractCommand } from './extract.js';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

describe('Synchronization Protocol', () => {
  const localDir = './test-sync-local';
  const remoteDir = './test-sync-remote';
  let packCommand: PackCommand;
  let extractCommand: ExtractCommand;

  beforeEach(() => {
    packCommand = new PackCommand();
    extractCommand = new ExtractCommand();

    if (existsSync(localDir)) rmSync(localDir, { recursive: true, force: true });
    if (existsSync(remoteDir)) rmSync(remoteDir, { recursive: true, force: true });

    mkdirSync(localDir);
    mkdirSync(remoteDir);

    writeFileSync(join(localDir, 'file1.txt'), 'content1');
    writeFileSync(join(localDir, 'file2.txt'), 'content2');
    
    writeFileSync(join(remoteDir, 'file1.txt'), 'content1');
  });

  afterEach(() => {
    if (existsSync(localDir)) rmSync(localDir, { recursive: true, force: true });
    if (existsSync(remoteDir)) rmSync(remoteDir, { recursive: true, force: true });
  });

  it('should generate hashes', async () => {
    const result = await packCommand.execute([localDir, '--hashes'], { json: true, silent: true }, { stdinIsPipe: false });
    expect(result.success).toBe(true);
    const hashes = JSON.parse(result.output!);
    expect(hashes['file1.txt']).toBeDefined();
    expect(hashes['file2.txt']).toBeDefined();
  });

  it('should pack deltas', async () => {
    // 1. Get remote hashes
    const remoteHashesResult = await packCommand.execute([remoteDir, '--hashes'], { json: true, silent: true }, { stdinIsPipe: false });
    const remoteHashes = remoteHashesResult.output!;

    // 2. Pack delta from local to remote
    // Mock stdin for pack command to read remote hashes
    const inputModule = await import('../utils/input.js');
    vi.spyOn(inputModule, 'readFromInput').mockResolvedValue(remoteHashes);

    const deltaResult = await packCommand.execute([localDir, '--delta'], { json: true, silent: true }, { stdinIsPipe: true });
    expect(deltaResult.success).toBe(true);
    
    const snapshot = JSON.parse(deltaResult.output!);
    expect(Object.keys(snapshot.files)).toHaveLength(1);
    expect(snapshot.files['file2.txt']).toBe('content2');
    expect(snapshot.files['file1.txt']).toBeUndefined();
  });

  it('should sync via stream', async () => {
    // This is a complex integration test
    // 1. Get remote hashes
    const remoteHashesResult = await packCommand.execute([remoteDir, '--hashes'], { json: true, silent: true }, { stdinIsPipe: false });
    const remoteHashes = remoteHashesResult.output!;

    // 2. Create delta stream
    // Mock stdin for pack
    const inputModule = await import('../utils/input.js');
    vi.spyOn(inputModule, 'readFromInput').mockResolvedValue(remoteHashes);

    // Capture stdout for pack --stream
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    await packCommand.execute([localDir, '--delta', '--stream'], { silent: true }, { stdinIsPipe: true });
    
    const output = stdoutSpy.mock.calls.map(call => call[0]).join('');
    stdoutSpy.mockRestore();

    expect(output).toContain('--JREF-START--');
    expect(output).toContain('--JREF-END--');

    // 3. Extract stream on "remote"
    const streamContent = output;
    const mockStdin = Readable.from([streamContent]);
    
    // Mock process.stdin for ExtractCommand
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', {
        value: mockStdin,
        configurable: true
    });

    await extractCommand.execute(['--listen', '--output', remoteDir], { silent: true }, { stdinIsPipe: true });
    
    // Restore stdin
    Object.defineProperty(process, 'stdin', {
        value: originalStdin,
        configurable: true
    });

    // Verify file2.txt was created on remote
    expect(existsSync(join(remoteDir, 'file2.txt'))).toBe(true);
    expect(readFileSync(join(remoteDir, 'file2.txt'), 'utf8')).toBe('content2');
  });
});
