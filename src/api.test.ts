import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pack, query, buildGraph, search, extract, flatten, validate, get, startUI } from './index.js';
import { PackCommand } from './commands/pack.js';
import { QueryCommand } from './commands/query.js';
import { GraphCommand } from './commands/graph.js';
import { SearchCommand } from './commands/search.js';
import { ExtractCommand } from './commands/extract.js';
import { FlattenCommand } from './commands/flatten.js';
import { ValidateCommand } from './commands/validate.js';
import { GetCommand } from './commands/get.js';
import { UICommand } from './commands/ui.js';

vi.mock('./commands/pack.js');
vi.mock('./commands/query.js');
vi.mock('./commands/graph.js');
vi.mock('./commands/search.js');
vi.mock('./commands/extract.js');
vi.mock('./commands/flatten.js');
vi.mock('./commands/validate.js');
vi.mock('./commands/get.js');
vi.mock('./commands/ui.js');

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

  it('should call SearchCommand programmatically', async () => {
    const mockResults = [{ filePath: 'test.ts', matches: [], score: 1 }];
    const executeSpy = vi.fn().mockResolvedValue({ 
      success: true, 
      exitCode: 0, 
      data: { results: mockResults } 
    });
    
    (SearchCommand as any).mockImplementation(() => ({
      execute: executeSpy
    }));

    const result = await search({ files: {}, directoryStructure: '' }, 'pattern');
    expect(executeSpy).toHaveBeenCalled();
    expect(result).toEqual(mockResults);
  });

  it('should call ExtractCommand programmatically', async () => {
    const executeSpy = vi.fn().mockResolvedValue({ 
      success: true, 
      exitCode: 0, 
      data: { total: 1 } 
    });
    
    (ExtractCommand as any).mockImplementation(() => ({
      execute: executeSpy
    }));

    const result = await extract({ files: {}, directoryStructure: '' });
    expect(executeSpy).toHaveBeenCalled();
    expect(result.total).toBe(1);
  });

  it('should call UICommand programmatically', async () => {
    const executeSpy = vi.fn().mockResolvedValue({ 
      success: true, 
      exitCode: 0 
    });
    
    (UICommand as any).mockImplementation(() => ({
      execute: executeSpy
    }));

    await startUI({ files: {}, directoryStructure: '' });
    expect(executeSpy).toHaveBeenCalled();
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

