import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PackCommand } from './pack.js';
import { QueryCommand } from './query.js';
import * as embeddings from '../utils/embeddings.js';
import * as fs from 'fs';

vi.mock('../utils/embeddings.js', () => ({
  generateEmbedding: vi.fn(async () => new Array(384).fill(0.1)),
  cosineSimilarity: vi.fn((a, b) => 0.95)
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs') as any;
  return {
    ...actual,
    writeFileSync: vi.fn(),
    readFileSync: vi.fn((path) => {
      if (path.endsWith('.json')) return JSON.stringify({ files: {}, chunks: [{ content: 'test', embedding: [] }] });
      return 'content';
    }),
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => [])
  };
});

describe('Semantic RAG Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pack with semantic chunks when --semantic flag is used', async () => {
    const packCmd = new PackCommand();
    const result = await packCmd.execute(['.', '--semantic'], { silent: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    expect(embeddings.generateEmbedding).toHaveBeenCalled();
  });

  it('should query semantically when --semantic flag is used', async () => {
    const queryCmd = new QueryCommand();
    const context = {
        snapshot: {
            files: { 'test.ts': 'export function test() {}' },
            chunks: [
                {
                    filePath: 'test.ts',
                    startLine: 1,
                    endLine: 1,
                    type: 'function',
                    name: 'test',
                    content: 'export function test() {}',
                    embedding: new Array(384).fill(0.1)
                }
            ]
        },
        stdinIsPipe: false
    };

    const result = await queryCmd.execute(['--semantic', 'How to test?'], { json: true }, context as any);
    
    expect(result.success).toBe(true);
    const output = JSON.parse(result.output!);
    expect(output[0].chunk.name).toBe('test');
    expect(embeddings.generateEmbedding).toHaveBeenCalledWith('How to test?');
  });
});
