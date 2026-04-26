/**
 * Format Utility
 * Handles sniffing and translation of different snapshot formats
 * Supports JSON, JSON5, JSONC, YAML, TOML, and Repomix XML
 */
import { type ProjectSnapshot } from '../types/index.js';
export type SnapshotFormat = 'json' | 'json5' | 'yaml' | 'toml' | 'xml' | 'unknown';
/**
 * Sniff format from content or file extension
 */
export declare function sniffFormat(content: string, filePath?: string): SnapshotFormat;
/**
 * Translate content from any supported format to ProjectSnapshot
 */
export declare function translateSnapshot(content: string, format: SnapshotFormat): Promise<ProjectSnapshot>;
/**
 * Lightweight implementation stripping using regex
 * Handles common JS/TS/Python/Zig patterns
 */
export declare function stripImplementation(content: string): string;
//# sourceMappingURL=format.d.ts.map