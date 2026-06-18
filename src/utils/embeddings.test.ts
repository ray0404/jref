import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Embeddings Utility', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate an embedding', async () => {
    const mockPipe = vi.fn().mockResolvedValue({ data: [0.1, 0.2, 0.3] });
    vi.doMock('@xenova/transformers', () => ({
      env: { wasm: {} },
      pipeline: vi.fn().mockResolvedValue(mockPipe)
    }));

    const { generateEmbedding } = await import('./embeddings.js');
    const result = await generateEmbedding('test text');

    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(mockPipe).toHaveBeenCalledWith('test text', { pooling: 'mean', normalize: true });
  });

  it('should throw an error if pipeline initialization fails', async () => {
    const error = new Error('Pipeline failed');
    vi.doMock('@xenova/transformers', () => ({
      env: { wasm: {} },
      pipeline: vi.fn().mockRejectedValue(error)
    }));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { generateEmbedding } = await import('./embeddings.js');
    await expect(generateEmbedding('test')).rejects.toThrow('Pipeline failed');

    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Failed to load embedding model:', error);
  });

  it('should compute cosine similarity correctly', async () => {
    const { cosineSimilarity } = await import('./embeddings.js');

    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecB)).toBe(0);

    const vecC = [1, 1, 1];
    const vecD = [2, 2, 2];
    expect(cosineSimilarity(vecC, vecD)).toBeCloseTo(1);

    // Edge cases
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1], [1, 2])).toBe(0); // different lengths
    expect(cosineSimilarity(null as any, [1])).toBe(0);
  });
});
