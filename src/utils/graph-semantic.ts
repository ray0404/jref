import * as path from 'path';
import * as os from 'os';
import { GraphNode, GraphEdge, CodeChunk } from '../types/index.js';
import { chunkCode } from './chunking.js';

/**
 * Utility for semantic graph extraction using local embeddings.
 */

export interface SemanticExtractionOptions {
  model?: string;
  threshold?: number;
}

let transformersLib: any = null;

async function getTransformers() {
  if (!transformersLib) {
    try {
      // Dynamically import to allow setting environment variables before loading backends
      const { env, pipeline } = await import('@xenova/transformers');
      
      // Explicitly set backend to wasm to avoid onnxruntime-node dependency on Android/Termux
      (env as any).backend = 'wasm';
      env.allowRemoteModels = true;
      
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
 * Infers semantic relationships between nodes using local embedding models.
 */
export async function inferSemanticEdges(
  _nodes: GraphNode[], 
  fileContents: Record<string, string>,
  options: SemanticExtractionOptions = {}
): Promise<GraphEdge[]> {
  const modelName = options.model || 'Xenova/all-MiniLM-L6-v2';
  const threshold = options.threshold || 0.85;

  try {
    const { pipeline, env } = await getTransformers();
    
    // Configure cache directory
    env.cacheDir = path.join(os.homedir(), '.jref', 'models');

    const extractor = await pipeline('feature-extraction', modelName);
    
    // 1. Chunk and embed all files
    const chunks: CodeChunk[] = [];
    for (const [filePath, content] of Object.entries(fileContents)) {
      const fileChunks = chunkCode(filePath, content);
      chunks.push(...fileChunks);
    }

    // 2. Generate embeddings for each chunk
    for (const chunk of chunks) {
      const result = await extractor(chunk.content, { pooling: 'mean', normalize: true });
      chunk.embedding = Array.from(result.data as Float32Array);
    }

    const edges: GraphEdge[] = [];

    // 3. Compare chunks to generate semantic edges
    for (let i = 0; i < chunks.length; i++) {
      for (let j = i + 1; j < chunks.length; j++) {
        const chunkA = chunks[i];
        const chunkB = chunks[j];

        if (chunkA.embedding && chunkB.embedding) {
          const similarity = cosineSimilarity(chunkA.embedding, chunkB.embedding);
          
          if (similarity > threshold) {
            edges.push({
              source: chunkA.filePath, // Simplified: edge between files
              target: chunkB.filePath,
              relation: 'semantic_similarity',
              confidence: 'INFERRED',
              weight: similarity
            });
          }
        }
      }
    }

    return edges;
  } catch (err) {
    console.warn(`Semantic inference failed: ${(err as Error).message}`);
    return [];
  }
}

/**
 * Calculates cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Builds a prompt for the LLM to perform semantic extraction (Legacy/External).
 */
export function buildSemanticPrompt(nodes: GraphNode[], chunks: { path: string, content: string }[]): string {
  const symbolList = nodes.map(n => `- ${n.id} (${n.label}, type: ${n.type})`).join('\n');
  const chunkList = chunks.map(c => `File: ${c.path}\nContent:\n${c.content}`).join('\n---\n');
  
  return `
    Analyze the following code symbols and documentation chunks from a software project.
    Identify high-level conceptual relationships that are not explicitly defined in the code imports.
    
    Known Symbols:
    ${symbolList}
    
    Content Chunks:
    ${chunkList}
    
    Task:
    Return a JSON object with an "edges" array.
    Each edge must have:
    - source: string (must match a symbol ID or file path)
    - target: string (must match a symbol ID or file path)
    - relation: string (e.g., "rationale_for", "implements_concept", "semantically_similar_to")
    - confidence: "INFERRED"
    - weight: number (0.0 to 1.0)
    
    Only return valid JSON.
  `;
}
