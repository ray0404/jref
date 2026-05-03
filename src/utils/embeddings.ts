/**
 * Embeddings Utility
 * Generates local embeddings using @xenova/transformers (ONNX Runtime).
 * Optimized for local-only semantic search.
 */

let embeddingPipeline: any = null;
let transformersLib: any = null;

async function getTransformers() {
  if (!transformersLib) {
    try {
      // Dynamically import to allow setting environment variables before loading backends
      const { env, pipeline } = await import('@xenova/transformers');
      
      // Explicitly set backend to wasm to avoid onnxruntime-node dependency on Android/Termux
      (env as any).backend = 'wasm';
      env.allowRemoteModels = true;
      env.localModelPath = './models/';

      // Additional Termux/Node.js shimming for onnxruntime-web
      if (typeof process !== 'undefined' && process.release?.name === 'node') {
        (env as any).wasm.numThreads = 1;
        (env as any).wasm.proxy = false;
      }
      
      transformersLib = { env, pipeline };
    } catch (err) {
      console.warn('⚠️ @xenova/transformers not found. Semantic search/embeddings disabled.');
      throw err;
    }
  }
  return transformersLib;
}

/**
 * Initialize the embedding pipeline
 */
export async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    const { pipeline } = await getTransformers();
    try {
      // Use a small, efficient model
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (err) {
      console.error('❌ Failed to load embedding model:', err);
      throw err;
    }
  }
  return embeddingPipeline;
}

/**
 * Generate an embedding for a string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return isNaN(similarity) ? 0 : similarity;
}
