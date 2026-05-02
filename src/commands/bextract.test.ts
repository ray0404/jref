/**
 * BExtract Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BExtractCommand } from './bextract.js';
import type { CommandContext } from '../types/index.js';

describe('BExtractCommand', () => {
  let command: BExtractCommand;

  beforeEach(() => {
    command = new BExtractCommand();
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('bextract');
  });

  it('should pipe decoded content to stdout when --stdout is used', async () => {
    const binarySnapshot = {
      encodings: {
        'kick.wav': 'base64'
      },
      files: {
        'kick.wav': Buffer.from('RIFF....WAVEbinarydata').toString('base64')
      }
    };
    const context: CommandContext = {
      stdin: JSON.stringify(binarySnapshot),
      stdinIsPipe: true
    };

    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const result = await command.execute(['--stdout', 'kick.wav'], {}, context);

    expect(result.success).toBe(true);
    expect(stdoutSpy).toHaveBeenCalled();
    const pipedData = stdoutSpy.mock.calls[0][0] as Buffer;
    expect(pipedData.toString()).toContain('RIFF');
    expect(pipedData.toString()).toContain('WAVE');
    
    stdoutSpy.mockRestore();
  });

  it('should fail if no patterns provided for --stdout', async () => {
    const context: CommandContext = {
        stdin: '{}',
        stdinIsPipe: true
    };
    const result = await command.execute(['--stdout'], {}, context);
    expect(result.success).toBe(false);
  });
});
