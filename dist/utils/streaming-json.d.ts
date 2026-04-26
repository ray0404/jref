/**
 * Streaming JSON Parser Utility
 * Implements stream-json strategy for handling massive JSON files
 * without heap overflow on lower-memory devices (Raspberry Pi, Termux)
 */
import { type ProjectSnapshot, type SnapshotMetadata, type CLIOptions } from '../types/index.js';
/**
 * Parse JSON from string input with size check
 * Uses native JSON.parse for smaller files, streaming for larger ones
 * Implements schema validation and coercion
 */
export declare function parseJSON(input: string, filePath?: string, options?: CLIOptions): Promise<ProjectSnapshot>;
/**
 * Streaming process for snapshots of any size (up to 1GB+)
 * Dispatches metadata and files to callbacks to maintain low memory usage
 */
export declare function processSnapshot(input: string | NodeJS.ReadableStream, callbacks: {
    onMetadata?: (key: string, value: any) => void;
    onFile?: (path: string, content: string) => Promise<void> | void;
}): Promise<void>;
/**
 * Generate ASCII directory structure from list of file paths
 */
export declare function generateDirectoryStructure(paths: string[]): string;
/**
 * Load snapshot from file path
 */
export declare function loadSnapshotFromFile(filePath: string, options?: CLIOptions): Promise<ProjectSnapshot>;
/**
 * Load snapshot from stdin or string input
 */
export declare function loadSnapshot(input?: string | undefined, options?: CLIOptions): Promise<ProjectSnapshot>;
/**
 * Calculate metadata from snapshot
 */
export declare function calculateMetadata(snapshot: ProjectSnapshot): SnapshotMetadata;
/**
 * Validate snapshot structure
 */
export declare function validateSnapshot(snapshot: unknown): snapshot is ProjectSnapshot;
/**
 * Get file paths from snapshot
 */
export declare function getFilePaths(snapshot: ProjectSnapshot, prefix?: string): string[];
/**
 * Extract specific files from snapshot
 */
export declare function extractFiles(snapshot: ProjectSnapshot, paths: string[]): Record<string, string>;
//# sourceMappingURL=streaming-json.d.ts.map