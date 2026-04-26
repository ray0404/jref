/**
 * Streaming JSON Parser Utility
 * Implements stream-json strategy for handling massive JSON files
 * without heap overflow on lower-memory devices (Raspberry Pi, Termux)
 */
import { readFileSync } from 'fs';
import { Readable } from 'stream';
import { readFromInput } from './input.js';
import { ProjectSnapshotSchema } from '../types/index.js';
import parser from 'stream-json/parser.js';
import { sniffFormat, translateSnapshot } from './format.js';
import jq from 'jq-wasm';
const MAX_BUFFER_SIZE = 8 * 1024 * 1024; // 8MB max buffer before streaming parse
/**
 * Parse JSON from string input with size check
 * Uses native JSON.parse for smaller files, streaming for larger ones
 * Implements schema validation and coercion
 */
export async function parseJSON(input, filePath, options) {
    const format = sniffFormat(input, filePath);
    if (format !== 'json' && format !== 'json5') {
        // For non-JSON formats, we currently use the translation utility
        // which may not be fully streaming-optimized for 1GB+ but handles reasonable sizes
        const snap = await translateSnapshot(input, format);
        return await applyJQ(snap, options);
    }
    const size = Buffer.byteLength(input, 'utf8');
    let snapshot;
    if (size < MAX_BUFFER_SIZE && format === 'json') {
        try {
            snapshot = JSON.parse(input);
        }
        catch {
            // Try JSON5 as fallback
            const snap = await translateSnapshot(input, 'json5');
            return await applyJQ(snap, options);
        }
    }
    else {
        // Use streaming parser for large JSON files
        const temp = { files: {} };
        await processSnapshot(input, {
            onMetadata: (key, value) => {
                temp[key] = value;
            },
            onFile: (path, content) => {
                temp.files[path] = content;
            }
        });
        snapshot = temp;
    }
    return await applyJQ(snapshot, options);
}
/**
 * Apply jq filter to snapshot if options.jq is present
 * Handles schema drift by printing raw JSON and exiting if validation fails
 */
async function applyJQ(snapshot, options) {
    if (options?.jq) {
        try {
            snapshot = await jq.json(snapshot, options.jq);
        }
        catch (err) {
            throw new Error(`JQ Execution Failed: ${err.message}`);
        }
        // Validate schema after jq transformation
        const result = ProjectSnapshotSchema.safeParse(snapshot);
        if (!result.success) {
            // If it fails schema check with JQ active, assume user wants raw data extraction
            console.log(JSON.stringify(snapshot, null, 2));
            process.exit(0);
        }
        snapshot = result.data;
    }
    else {
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
    }
    else if (!snapshot.directoryStructure) {
        snapshot.directoryStructure = '';
    }
    return snapshot;
}
/**
 * Streaming process for snapshots of any size (up to 1GB+)
 * Dispatches metadata and files to callbacks to maintain low memory usage
 */
export async function processSnapshot(input, callbacks) {
    // If input is a string, check format first
    if (typeof input === 'string') {
        const format = sniffFormat(input);
        if (format !== 'json' && format !== 'json5') {
            const snapshot = await translateSnapshot(input, format);
            if (callbacks.onMetadata) {
                if (snapshot.directoryStructure)
                    callbacks.onMetadata('directoryStructure', snapshot.directoryStructure);
                if (snapshot.instruction)
                    callbacks.onMetadata('instruction', snapshot.instruction);
                if (snapshot.fileSummary)
                    callbacks.onMetadata('fileSummary', snapshot.fileSummary);
                if (snapshot.userProvidedHeader)
                    callbacks.onMetadata('userProvidedHeader', snapshot.userProvidedHeader);
            }
            if (callbacks.onFile) {
                for (const [path, content] of Object.entries(snapshot.files)) {
                    await callbacks.onFile(path, content);
                }
            }
            return;
        }
    }
    return new Promise((resolve, reject) => {
        const inputStream = typeof input === 'string' ? Readable.from([input]) : input;
        const p = parser.asStream();
        inputStream.pipe(p);
        let currentKey = null;
        let inFiles = false;
        let filesLevel = 0;
        let currentFileKey = null;
        let pendingOps = 0;
        let finished = false;
        const checkFinished = () => {
            if (finished && pendingOps === 0) {
                resolve();
            }
        };
        p.on('data', (data) => {
            try {
                if (data.name === 'keyValue') {
                    if (inFiles && filesLevel === 0) {
                        currentFileKey = data.value;
                    }
                    else if (!inFiles) {
                        currentKey = data.value;
                    }
                    return;
                }
                if (data.name === 'startObject') {
                    if (currentKey === 'files' && !inFiles) {
                        inFiles = true;
                        filesLevel = 0;
                    }
                    else if (inFiles) {
                        filesLevel++;
                    }
                    return;
                }
                if (data.name === 'endObject') {
                    if (inFiles) {
                        if (filesLevel === 0) {
                            inFiles = false;
                            currentKey = null;
                        }
                        else {
                            filesLevel--;
                        }
                    }
                    return;
                }
                if (data.name === 'stringValue' || data.name === 'numberValue' || data.name === 'booleanValue' || data.name === 'nullValue') {
                    if (inFiles && filesLevel === 0 && currentFileKey) {
                        if (callbacks.onFile) {
                            const result = callbacks.onFile(currentFileKey, data.value);
                            if (result instanceof Promise) {
                                pendingOps++;
                                p.pause();
                                result.then(() => {
                                    pendingOps--;
                                    p.resume();
                                    checkFinished();
                                }).catch((err) => {
                                    p.destroy(err);
                                });
                            }
                        }
                        currentFileKey = null;
                    }
                    else if (!inFiles && currentKey) {
                        if (callbacks.onMetadata) {
                            callbacks.onMetadata(currentKey, data.value);
                        }
                        currentKey = null;
                    }
                }
            }
            catch (err) {
                p.destroy(err);
            }
        });
        p.on('end', () => {
            finished = true;
            checkFinished();
        });
        p.on('error', reject);
    });
}
/**
 * Generate ASCII directory structure from list of file paths
 */
export function generateDirectoryStructure(paths) {
    if (paths.length === 0)
        return '';
    const root = {};
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
    function render(obj, prefix) {
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
 * Load snapshot from file path
 */
export async function loadSnapshotFromFile(filePath, options) {
    const content = readFileSync(filePath, 'utf8');
    return parseJSON(content, filePath, options);
}
/**
 * Load snapshot from stdin or string input
 */
export async function loadSnapshot(input = undefined, options) {
    let data;
    if (input) {
        data = input;
    }
    else {
        data = await readFromInput();
    }
    if (!data.trim()) {
        throw new Error('No input provided');
    }
    return parseJSON(data, undefined, options);
}
/**
 * Calculate metadata from snapshot
 */
export function calculateMetadata(snapshot) {
    const files = snapshot.files || {};
    const fileCount = Object.keys(files).length;
    let totalSize = 0;
    for (const content of Object.values(files)) {
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
export function validateSnapshot(snapshot) {
    return ProjectSnapshotSchema.safeParse(snapshot).success;
}
/**
 * Get file paths from snapshot
 */
export function getFilePaths(snapshot, prefix) {
    const paths = Object.keys(snapshot.files || {});
    if (!prefix) {
        return paths;
    }
    return paths.filter((p) => p.startsWith(prefix));
}
/**
 * Extract specific files from snapshot
 */
export function extractFiles(snapshot, paths) {
    const result = {};
    const files = snapshot.files || {};
    for (const path of paths) {
        if (files[path] !== undefined) {
            result[path] = files[path];
        }
    }
    return result;
}
//# sourceMappingURL=streaming-json.js.map