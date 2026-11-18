/**
 * @module StreamingJSON
 * Memory-efficient JSON processing utilities.
 * Implements a streaming strategy using `stream-json` to handle massive snapshots
 * (100MB to 1GB+) without heap overflow, making it compatible with lower-memory
 * environments like Raspberry Pi, Termux, or resource-constrained CI agents.
 */

import { readFileSync } from 'fs';
import { Readable } from 'stream';
import { readFromInput } from './input.js';
import { ProjectSnapshotSchema, type ProjectSnapshot, type SnapshotMetadata, type CLIOptions } from '../types/index.js';
import parser from 'stream-json/parser.js';
import { sniffFormat, translateSnapshot } from './format.js';
import jq from 'jq-wasm';

/**
 * Maximum buffer size (8MB) allowed for synchronous JSON parsing.
 * Files exceeding this threshold are automatically processed via the streaming parser.
 */
const MAX_BUFFER_SIZE = 8 * 1024 * 1024; // 8MB max buffer before streaming parse

/**
 * High-level entry point for parsing JSON input into a ProjectSnapshot.
 * Automatically chooses between native `JSON.parse` (for speed on small files)
 * and the streaming parser (for memory safety on large files).
 * 
 * @param input - The raw JSON string or data to parse.
 * @param filePath - Optional file path for format sniffing and error reporting.
 * @param options - CLI options, including JQ filters and validation settings.
 * @returns A promise resolving to a validated ProjectSnapshot.
 * @throws Error if the input is malformed or violates the required schema.
 * 
 * @example
 * ```ts
 * const snapshot = await parseJSON(rawContent, 'project.json');
 * ```
 */
export async function parseJSON(input: string, filePath?: string, options?: CLIOptions): Promise<ProjectSnapshot> {
  const format = sniffFormat(input, filePath);

  if (format !== 'json' && format !== 'json5') {
    // For non-JSON formats, we currently use the translation utility
    // which may not be fully streaming-optimized for 1GB+ but handles reasonable sizes
    const snap = await translateSnapshot(input, format);
    return await applyJQ(snap, options);
  }

  const size = Buffer.byteLength(input, 'utf8');
  let snapshot: ProjectSnapshot;

  if (size < MAX_BUFFER_SIZE && format === 'json') {
    try {
      snapshot = JSON.parse(input) as ProjectSnapshot;
    } catch {
      // Try JSON5 as fallback
      const snap = await translateSnapshot(input, 'json5');
      return await applyJQ(snap, options);
    }
  } else {
    // Use streaming parser for large JSON files
    const temp: any = { files: {} };
    await processSnapshot(input, {
      onMetadata: (key, value) => {
        if (key === 'encodings') {
          if (!temp.encodings) temp.encodings = {};
          Object.assign(temp.encodings, value);
        } else {
          temp[key] = value;
        }
      },
      onFile: (path, content) => {
        temp.files[path] = content;
      }
    });
    snapshot = temp as ProjectSnapshot;
  }

  return await applyJQ(snapshot, options);
}

/**
 * Applies a JQ filter to the snapshot and validates the resulting structure.
 * If validation fails after a JQ filter is applied, it assumes the user is performing
 * a custom extraction and prints the raw result to stdout before exiting.
 * 
 * @param snapshot - The raw snapshot object to transform.
 * @param options - CLI options containing the `.jq` filter string.
 * @returns The transformed and validated ProjectSnapshot.
 */
async function applyJQ(snapshot: any, options?: CLIOptions): Promise<ProjectSnapshot> {
  if (options?.jq) {
    try {
      snapshot = await jq.json(snapshot, options.jq);
    } catch (err) {
      throw new Error(`JQ Execution Failed: ${(err as Error).message}`);
    }

    // Validate schema after jq transformation
    const result = ProjectSnapshotSchema.safeParse(snapshot);
    if (!result.success) {
      // If it fails schema check with JQ active, assume user wants raw data extraction
      console.log(JSON.stringify(snapshot, null, 2));
      process.exit(0);
    }
    snapshot = result.data;
  } else {
    // Standard validation
    const result = ProjectSnapshotSchema.safeParse(snapshot);
    if (!result.success) {
      throw new Error(`Invalid snapshot schema: ${result.error.message}`);
    }
    snapshot = result.data;
  }

  // Coercion logic: if directoryStructure is missing but files exists, generate it
  if (!snapshot.directoryStructure && snapshot.files && Object.keys(snapshot.files).length > 0) {
    snapshot.directoryStructure = generateDirectoryStructure(Object.keys(snapshot.files));
  } else if (!snapshot.directoryStructure) {
      snapshot.directoryStructure = '';
  }

  return snapshot as ProjectSnapshot;
}

/**
 * Core streaming processor that traverses a JSON snapshot token-by-token.
 * Dispatches metadata and file contents to callbacks as they are parsed, 
 * maintaining a near-constant memory footprint regardless of file size.
 * 
 * @param input - A JSON string or a Readable stream.
 * @param callbacks - Callback functions for handling parsed components.
 * @param callbacks.onMetadata - Called when non-file metadata (e.g., instruction, roadmap) is parsed.
 * @param callbacks.onFile - Called when a file path and its content are fully parsed.
 * @returns A promise that resolves when the stream has been fully processed.
 */
export async function processSnapshot(
  input: string | NodeJS.ReadableStream,
  callbacks: {
    onMetadata?: (key: string, value: any) => void;
    onFile?: (path: string, content: string) => Promise<void> | void;
  }
): Promise<void> {
  // If input is a string, check size and format first
  if (typeof input === 'string') {
    const size = Buffer.byteLength(input, 'utf8');
    const format = sniffFormat(input);

    if (size < MAX_BUFFER_SIZE && (format === 'json' || format === 'json5')) {
      try {
        const snapshot = format === 'json' ? JSON.parse(input) : (await translateSnapshot(input, 'json5'));
        if (callbacks.onMetadata) {
          if (snapshot.directoryStructure) callbacks.onMetadata('directoryStructure', snapshot.directoryStructure);
          if (snapshot.instruction) callbacks.onMetadata('instruction', snapshot.instruction);
          if (snapshot.fileSummary) callbacks.onMetadata('fileSummary', snapshot.fileSummary);
          if (snapshot.userProvidedHeader) callbacks.onMetadata('userProvidedHeader', snapshot.userProvidedHeader);
          if (snapshot.sources) callbacks.onMetadata('sources', snapshot.sources);
          if (snapshot.encodings) {
            for (const [path, enc] of Object.entries(snapshot.encodings)) {
              callbacks.onMetadata('encodings', { [path]: enc });
            }
          }
        }
        if (callbacks.onFile) {
          for (const [path, content] of Object.entries(snapshot.files)) {
            await callbacks.onFile(path, content as string);
          }
        }
        return;
      } catch {
        // Fallback to streaming if parse fails
      }
    }

    if (format !== 'json' && format !== 'json5') {
      const snapshot = await translateSnapshot(input, format);
      if (callbacks.onMetadata) {
        if (snapshot.directoryStructure) callbacks.onMetadata('directoryStructure', snapshot.directoryStructure);
        if (snapshot.instruction) callbacks.onMetadata('instruction', snapshot.instruction);
        if (snapshot.fileSummary) callbacks.onMetadata('fileSummary', snapshot.fileSummary);
        if (snapshot.userProvidedHeader) callbacks.onMetadata('userProvidedHeader', snapshot.userProvidedHeader);
        if (snapshot.sources) callbacks.onMetadata('sources', snapshot.sources);
        if (snapshot.encodings) {
           for (const [path, enc] of Object.entries(snapshot.encodings)) {
             callbacks.onMetadata('encodings', { [path]: enc });
           }
        }
      }
      if (callbacks.onFile) {
        for (const [path, content] of Object.entries(snapshot.files)) {
          await callbacks.onFile(path, content as string);
        }
      }
      return;
    }
  }

  return new Promise((resolve, reject) => {
    const inputStream = typeof input === 'string' ? Readable.from([input]) : input;
    const p = (parser as any).asStream();
    
    let currentKey: string | null = null;
    let inFiles = false;
    let inEncodings = false;
    let objectLevel = 0;
    let currentFileKey: string | null = null;
    let pendingOps = 0;
    let finished = false;
    let isPaused = false;

    // Capturing the top-level `sources` array (array of objects) in
    // streaming mode. The parser emits scalars and `files` entries
    // directly, but a nested array value needs to be rebuilt token by
    // token; only `sources` is captured (other level-1 arrays keep
    // today's behaviour of being skipped).
    let captureKey: string | null = null;
    let captureName: string | null = null;
    let captureStack: any[] = [];
    let capturePendingKey: string | null = null;

    const attachCapture = (container: any): void => {
      if (captureStack.length === 0) {
        captureName = captureKey;
        captureKey = null;
        captureStack.push(container);
        return;
      }
      const parent = captureStack[captureStack.length - 1];
      if (Array.isArray(parent)) {
        parent.push(container);
      } else {
        parent[capturePendingKey as string] = container;
        capturePendingKey = null;
      }
      captureStack.push(container);
    };

    const finishCaptureContainer = (): void => {
      const done = captureStack.pop();
      if (captureStack.length === 0 && captureName && callbacks.onMetadata) {
        callbacks.onMetadata(captureName, done);
        captureName = null;
      }
    };

    const checkFinished = () => {
      if (finished && pendingOps === 0 && !isPaused) {
        resolve();
      }
    };

    p.on('data', (data: any) => {
      try {
        switch (data.name) {
          case 'keyValue':
            if (captureStack.length > 0) {
              capturePendingKey = data.value;
            } else if (objectLevel === 1) {
              currentKey = data.value;
              inFiles = currentKey === 'files';
              inEncodings = currentKey === 'encodings';
              captureKey = currentKey === 'sources' ? currentKey : null;
            } else if (objectLevel === 2) {
              currentFileKey = data.value;
            }
            break;

          case 'startObject':
            objectLevel++;
            if (captureKey || captureStack.length > 0) {
              attachCapture({});
            }
            break;

          case 'startArray':
            if (captureKey || captureStack.length > 0) {
              attachCapture([]);
            }
            break;

          case 'endObject':
            if (objectLevel === 2) {
              inFiles = false;
              inEncodings = false;
              currentFileKey = null;
            }
            objectLevel--;
            if (captureStack.length > 0) {
              finishCaptureContainer();
            }
            break;

          case 'endArray':
            if (captureStack.length > 0) {
              finishCaptureContainer();
            }
            break;

          case 'stringValue':
          case 'numberValue':
          case 'booleanValue':
          case 'nullValue':
          case 'trueValue':
          case 'falseValue': {
            // stream-json emits numbers as strings and booleans as
            // trueValue/falseValue tokens — coerce them so captured
            // values (e.g. a source's depth/dynamic) keep their JSON
            // types through the streaming path.
            const scalarValue =
              data.name === 'numberValue'
                ? Number(data.value)
                : data.name === 'trueValue'
                  ? true
                  : data.name === 'falseValue'
                    ? false
                    : data.value;
            if (captureStack.length > 0) {
              const top = captureStack[captureStack.length - 1];
              if (Array.isArray(top)) {
                top.push(scalarValue);
              } else {
                top[capturePendingKey as string] = scalarValue;
                capturePendingKey = null;
              }
            } else if (objectLevel === 2 && currentFileKey) {
              if (inFiles && callbacks.onFile) {
                const result = callbacks.onFile(currentFileKey, scalarValue);
                if (result instanceof Promise) {
                  pendingOps++;
                  isPaused = true;
                  p.pause();
                  result.then(() => {
                    pendingOps--;
                    isPaused = false;
                    p.resume();
                    checkFinished();
                  }).catch((err: any) => {
                    p.destroy(err);
                  });
                }
              } else if (inEncodings && callbacks.onMetadata) {
                callbacks.onMetadata('encodings', { [currentFileKey]: scalarValue });
              }
              currentFileKey = null;
            } else if (objectLevel === 1 && currentKey) {
              if (callbacks.onMetadata) {
                callbacks.onMetadata(currentKey, scalarValue);
              }
              currentKey = null;
            }
            break;
          }
        }
      } catch (err) {
        p.destroy(err as Error);
      }
    });

    p.on('end', () => {
      finished = true;
      checkFinished();
    });
    
    p.on('error', reject);
    inputStream.pipe(p);
  });
}

/**
 * Generates a visual ASCII tree representation of a directory structure from a flat list of paths.
 * 
 * @param paths - Array of relative file paths.
 * @returns An ASCII string representing the directory tree.
 */
export function generateDirectoryStructure(paths: string[]): string {
  if (paths.length === 0) return '';

  const root: any = {};
  for (const path of paths) {
    const parts = path.split('/');
    let current = root;
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  let output = '.\n';

  function render(obj: any, prefix: string) {
    const keys = Object.keys(obj).sort();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const isLast = i === keys.length - 1;
      const isDir = Object.keys(obj[key]).length > 0;
      
      output += prefix + (isLast ? '└── ' : '├── ') + key + (isDir ? '/' : '') + '\n';
      
      if (isDir) {
        render(obj[key], prefix + (isLast ? '    ' : '│   '));
      }
    }
  }

  render(root, '');
  return output;
}

/**
 * Loads and parses a snapshot from a file path.
 * 
 * @param filePath - The path to the snapshot file.
 * @param options - Optional CLI options.
 * @returns A promise resolving to the ProjectSnapshot.
 */
export async function loadSnapshotFromFile(filePath: string, options?: CLIOptions): Promise<ProjectSnapshot> {
  const content = readFileSync(filePath, 'utf8');
  return parseJSON(content, filePath, options);
}

/**
 * Loads a snapshot from stdin or an optional input string.
 * 
 * @param input - Optional raw string to use as input. If omitted, reads from stdin.
 * @param options - Optional CLI options.
 * @returns A promise resolving to the ProjectSnapshot.
 * @throws Error if no input is detected or provided.
 */
export async function loadSnapshot(input: string | undefined = undefined, options?: CLIOptions): Promise<ProjectSnapshot> {
  let data: string;

  if (input) {
    data = input;
  } else {
    data = await readFromInput();
  }

  if (!data.trim()) {
    throw new Error('No input provided');
  }

  return parseJSON(data, undefined, options);
}

/**
 * Calculates quantitative and qualitative metadata for a given snapshot.
 * 
 * @param snapshot - The snapshot to analyze.
 * @returns A SnapshotMetadata object containing counts and booleans.
 */
export function calculateMetadata(snapshot: ProjectSnapshot): SnapshotMetadata {
  const files = snapshot.files || {};
  const encodings = snapshot.encodings || {};
  const fileCount = Object.keys(files).length;
  let totalSize = 0;

  for (const [path, content] of Object.entries(files)) {
    if (encodings[path] === 'base64') {
      // Decoded size is approximately 0.75 * Base64 string length
      totalSize += Buffer.byteLength(content, 'base64');
    } else {
      totalSize += Buffer.byteLength(content, 'utf8');
    }
  }

  const sources = snapshot.sources || [];
  let totalSourceSize = 0;
  for (const source of sources) {
    totalSourceSize += Buffer.byteLength(source.markdown || '', 'utf8');
    totalSourceSize += Buffer.byteLength(source.html || '', 'utf8');
    if (source.rawHtml) totalSourceSize += Buffer.byteLength(source.rawHtml, 'utf8');
  }

  return {
    fileCount,
    totalSize,
    hasInstruction: Boolean(snapshot.instruction),
    hasRoadmap: Boolean(snapshot.roadmap),
    hasFileSummary: Boolean(snapshot.fileSummary),
    hasUserProvidedHeader: Boolean(snapshot.userProvidedHeader),
    directoryStructureLines: snapshot.directoryStructure
      ? snapshot.directoryStructure.split('\n').length
      : 0,
    sourceCount: sources.length,
    hasSources: sources.length > 0,
    totalSourceSize
  };
}

/**
 * Validates whether an unknown object matches the ProjectSnapshot schema.
 * 
 * @param snapshot - The object to validate.
 * @returns True if the object is a valid ProjectSnapshot.
 */
export function validateSnapshot(snapshot: unknown): snapshot is ProjectSnapshot {
  return ProjectSnapshotSchema.safeParse(snapshot).success;
}

/**
 * Retrieves a list of relative file paths present in the snapshot.
 * Optionally filters by a directory prefix.
 * 
 * @param snapshot - The snapshot to query.
 * @param prefix - Optional directory prefix to filter paths (e.g., "src/").
 * @returns Array of relative file paths.
 */
export function getFilePaths(snapshot: ProjectSnapshot, prefix?: string): string[] {
  const paths = Object.keys(snapshot.files || {});

  if (!prefix) {
    return paths;
  }

  return paths.filter((p) => p.startsWith(prefix));
}

/**
 * Extracts a subset of files from a snapshot based on an array of paths.
 * 
 * @param snapshot - The source snapshot.
 * @param paths - Array of relative paths to extract.
 * @returns A record map containing only the requested files.
 */
export function extractFiles(
  snapshot: ProjectSnapshot,
  paths: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  const files = snapshot.files || {};

  for (const path of paths) {
    if (files[path] !== undefined) {
      result[path] = files[path];
    }
  }

  return result;
}
