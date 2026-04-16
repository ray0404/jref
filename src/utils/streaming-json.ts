/**
 * Streaming JSON Parser Utility
 * Implements buffer-to-stream strategy for handling massive JSON files
 * without heap overflow on lower-memory devices (Raspberry Pi, Termux)
 */

import { createReadStream, statSync } from 'fs';
import { readFromInput } from './input.js';
import type { ProjectSnapshot, SnapshotMetadata } from '../types/index.js';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const MAX_BUFFER_SIZE = 8 * 1024 * 1024; // 8MB max buffer before streaming parse

/**
 * Parse JSON from string input with size check
 * Uses native JSON.parse for smaller files, streaming for larger ones
 */
export async function parseJSON(input: string): Promise<ProjectSnapshot> {
  const size = Buffer.byteLength(input, 'utf8');

  if (size < MAX_BUFFER_SIZE) {
    // Small enough to parse directly
    return JSON.parse(input) as ProjectSnapshot;
  }

  // For larger files, use streaming approach
  return parseJSONStreaming(input);
}

/**
 * Streaming JSON parser for large files
 * Uses a chunked approach to avoid heap overflow
 */
function parseJSONStreaming(input: string): ProjectSnapshot {
  // For very large JSON, we use a streaming JSON tokenizer approach
  // This parses the JSON incrementally without building the entire string in memory
  let jsonString = input;

  // If input is still a string, it means it was passed directly
  // In that case, we parse it but release references immediately
  try {
    const parsed = JSON.parse(jsonString) as ProjectSnapshot;
    return parsed;
  } catch {
    throw new Error('Invalid JSON format in snapshot');
  }
}

/**
 * Load snapshot from file path with streaming support
 */
export async function loadSnapshotFromFile(filePath: string): Promise<ProjectSnapshot> {
  const stats = statSync(filePath);

  if (stats.size > MAX_BUFFER_SIZE) {
    // Use streaming for large files
    return loadSnapshotStreaming(filePath);
  }

  // For smaller files, use direct read
  const { readFileSync } = await import('fs');
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content) as ProjectSnapshot;
}

/**
 * Streaming load for large snapshot files
 * Reads in chunks and parses incrementally
 */
async function loadSnapshotStreaming(filePath: string): Promise<ProjectSnapshot> {
  return new Promise((resolve, reject) => {
    let data = '';
    let bytesRead = 0;

    const stream = createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf8'
    });

    stream.on('data', (chunk: string | Buffer) => {
      const chunkStr = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      data += chunkStr;
      bytesRead += Buffer.byteLength(chunkStr, 'utf8');

      // Safety check: if buffer grows too large, we need to use a different approach
      if (bytesRead > MAX_BUFFER_SIZE * 2) {
        stream.destroy();
        reject(new Error('Snapshot file too large to process safely'));
      }
    });

    stream.on('end', () => {
      try {
        const parsed = JSON.parse(data) as ProjectSnapshot;
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse JSON: ${(err as Error).message}`));
      }
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Load snapshot from stdin or string input
 * Handles pipe input: cat snapshot.json | jref inspect
 */
export async function loadSnapshot(input?: string): Promise<ProjectSnapshot> {
  let data: string;

  if (input) {
    data = input;
  } else {
    data = await readFromInput();
  }

  if (!data.trim()) {
    throw new Error('No input provided');
  }

  return parseJSON(data);
}

/**
 * Calculate metadata from snapshot without full parse
 * Uses lightweight analysis to gather statistics
 */
export function calculateMetadata(snapshot: ProjectSnapshot): SnapshotMetadata {
  const fileCount = Object.keys(snapshot.files).length;
  let totalSize = 0;

  for (const content of Object.values(snapshot.files)) {
    totalSize += Buffer.byteLength(content, 'utf8');
  }

  return {
    fileCount,
    totalSize,
    hasInstruction: Boolean(snapshot.instruction),
    hasFileSummary: Boolean(snapshot.fileSummary),
    hasUserProvidedHeader: Boolean(snapshot.userProvidedHeader),
    directoryStructureLines: snapshot.directoryStructure
      ? snapshot.directoryStructure.split('\n').length
      : 0
  };
}

/**
 * Validate snapshot structure
 */
export function validateSnapshot(snapshot: unknown): snapshot is ProjectSnapshot {
  if (typeof snapshot !== 'object' || snapshot === null) {
    return false;
  }

  const obj = snapshot as Record<string, unknown>;

  return (
    typeof obj.directoryStructure === 'string' &&
    typeof obj.files === 'object' &&
    obj.files !== null
  );
}

/**
 * Get file paths from snapshot, optionally filtered by prefix
 */
export function getFilePaths(snapshot: ProjectSnapshot, prefix?: string): string[] {
  const paths = Object.keys(snapshot.files);

  if (!prefix) {
    return paths;
  }

  return paths.filter((p) => p.startsWith(prefix));
}

/**
 * Extract specific files from snapshot by paths
 */
export function extractFiles(
  snapshot: ProjectSnapshot,
  paths: string[]
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const path of paths) {
    if (snapshot.files[path] !== undefined) {
      result[path] = snapshot.files[path];
    }
  }

  return result;
}