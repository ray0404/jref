import { z } from 'zod';

/**
 * Project Snapshot Schema Types
 * Represents the structure of a condensed JSON project snapshot
 */

export interface CodeChunk {
  filePath: string;
  startLine: number;
  endLine: number;
  type: 'function' | 'class' | 'method' | 'block';
  name?: string;
  content: string;
  embedding?: number[];
}

export const ProjectSnapshotSchema = z.object({
  directoryStructure: z.string().optional(),
  files: z.record(z.string(), z.string()),
  encodings: z.record(z.string(), z.enum(['utf8', 'base64'])).optional(),
  instruction: z.string().optional(),
  fileSummary: z.string().optional(),
  userProvidedHeader: z.string().optional(),
  chunks: z.array(z.custom<CodeChunk>()).optional(),
});

export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;

/**
 * Graph Snapshot Schema Types
 */

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['code', 'doc', 'concept', 'binary']),
  source_file: z.string(),
  source_location: z.string().optional(),
  community: z.number().int().optional(),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string(),
  confidence: z.enum(['EXTRACTED', 'INFERRED', 'AMBIGUOUS']),
  weight: z.number().default(1.0),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphSnapshotSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export type GraphSnapshot = z.infer<typeof GraphSnapshotSchema>;

export const SnapshotMetadataSchema = z.object({
  fileCount: z.number(),
  totalSize: z.number(),
  hasInstruction: z.boolean(),
  hasFileSummary: z.boolean(),
  hasUserProvidedHeader: z.boolean(),
  directoryStructureLines: z.number(),
});

export type SnapshotMetadata = z.infer<typeof SnapshotMetadataSchema>;

export interface SearchResult {
  filePath: string;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  line: number;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface ExtractOptions {
  outputDir: string;
  paths?: string[];
  overwrite?: boolean;
  preservePermissions?: boolean;
}

export interface ReconstructResult {
  matches: boolean;
  missingFiles: string[];
  extraFiles: string[];
  modifiedFiles: string[];
  totalChecked: number;
}

export interface QueryOptions {
  path: string;
  raw?: boolean;
}

export interface CLIOptions {
  json?: boolean;
  silent?: boolean;
  raw?: boolean;
  help?: boolean;
  version?: boolean;
  jq?: string;
  ui?: boolean;
}

/**
 * Configuration schema for persistent jref settings
 */
export const JrefConfigSchema = z.object({
  defaultOutput: z.enum(['json', 'pretty', 'raw']).default('pretty'),
  silent: z.boolean().default(false),
  ui: z.object({
    theme: z.enum(['dark', 'light', 'system']).default('system'),
    showIcons: z.boolean().default(true),
  }).default({}),
  aliasToggle: z.boolean().default(true),
  binPath: z.string().optional(),
  defaultJq: z.string().optional(),
});

export type JrefConfig = z.infer<typeof JrefConfigSchema>;

export interface CommandContext {
  stdin?: string;
  stdinIsPipe: boolean;
  snapshot?: ProjectSnapshot;
  metadata?: SnapshotMetadata;
}

export type CommandExitCode = 0 | 1 | 2;

export interface CommandResult {
  success: boolean;
  exitCode: CommandExitCode;
  output?: string;
  error?: string;
}

/**
 * Alias Configuration
 */
export const AliasConfigSchema = z.record(z.string(), z.array(z.string()));

export type AliasConfig = z.infer<typeof AliasConfigSchema>;