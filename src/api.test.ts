import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pack, query, buildGraph } from './index.js';
import { PackCommand } from './commands/pack.js';
import { QueryCommand } from './commands/query.js';
import { GraphCommand } from './commands/graph.js';

vi.mock('./commands/pack.js');
vi.mock('./commands/query.js');
vi.mock('./commands/graph.js');

describe('jref Programmatic API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call PackCommand programmatically', async () => {
    const mockSnapshot = { files: { 'test.ts': 'content' }, directoryStructure: 'test.ts' };
    const executeSpy = vi.fn().mockResolvedValue({ 
      success: true, 
      exitCode: 0, 
      data: mockSnapshot 
    });
    
    (PackCommand as any).mockImplementation(() => ({
      execute: executeSpy
    }));

    const result = await pack('.');
    expect(executeSpy).toHaveBeenCalled();
    expect(result).toEqual(mockSnapshot);
  });

  it('should call QueryCommand programmatically', async () => {
    const mockData = { path: 'test.ts', content: 'content' };
    const executeSpy = vi.fn().mockResolvedValue({ 
      success: true, 
      exitCode: 0, 
      data: mockData 
    });
    
    (QueryCommand as any).mockImplementation(() => ({
      execute: executeSpy
    }));

    const result = await query({ files: {}, directoryStructure: '' }, { path: 'test.ts' });
    expect(executeSpy).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('should throw error when command fails', async () => {
    (PackCommand as any).mockImplementation(() => ({
      execute: vi.fn().mockResolvedValue({ 
        success: false, 
        exitCode: 1, 
        error: 'Failed to pack' 
      })
    }));

    await expect(pack('.')).rejects.toThrow('Failed to pack');
  });
});
