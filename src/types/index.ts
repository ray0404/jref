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
  roadmap: z.string().optional(),
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
  hasRoadmap: z.boolean(),
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
  }).default({ theme: 'system', showIcons: true }),
  aliasToggle: z.boolean().default(true),
  binPath: z.string().optional(),
  defaultJq: z.string().optional(),
  autoDownloadWasm: z.boolean().default(true),
});

export type JrefConfig = z.infer<typeof JrefConfigSchema>;

export interface CommandContext {
  stdin?: string;
  stdinIsPipe: boolean;
  snapshot?: ProjectSnapshot;
  metadata?: SnapshotMetadata;
  outputHandler?: (data: string, type: 'stdout' | 'stderr') => void;
}

export type CommandExitCode = 0 | 1 | 2;

export interface CommandResult<T = any> {
  success: boolean;
  exitCode: CommandExitCode;
  output?: string;
  data?: T;
  error?: string;
}

/**
 * Alias Configuration
 */
export const AliasConfigSchema = z.record(z.string(), z.array(z.string()));

export type AliasConfig = z.infer<typeof AliasConfigSchema>;

/**
 * Development Blueprint Schema Types
 * Refined structure for tracking features, bugs, and architectural changes.
 */

export const BlueprintMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'ARCHIVED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  complexity: z.number().min(1).max(10).optional(),
  tags: z.array(z.string()).optional(),
});

export const BlueprintSpecSchema = z.object({
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
});

export const BlueprintContextSchema = z.object({
  targetFiles: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  externalRefs: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).optional(),
});

export const BlueprintStepSchema = z.object({
  id: z.string(),
  task: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  tdd: z.boolean().default(false),
  notes: z.string().optional(),
});

export const BlueprintImplementationSchema = z.object({
  strategy: z.string(),
  steps: z.array(BlueprintStepSchema),
});

export const BlueprintVerificationSchema = z.object({
  unitTests: z.array(z.string()).optional(),
  integrationTests: z.array(z.string()).optional(),
  manualChecklist: z.array(z.object({
    item: z.string(),
    passed: z.boolean(),
  })).optional(),
});

export const DevelopmentBlueprintSchema = z.object({
  id: z.string(),
  metadata: BlueprintMetadataSchema,
  specification: BlueprintSpecSchema.optional(),
  context: BlueprintContextSchema.optional(),
  implementation: BlueprintImplementationSchema,
  verification: BlueprintVerificationSchema.optional(),
  history: z.array(z.object({
    timestamp: z.string(),
    event: z.string(),
    note: z.string().optional(),
  })).optional(),
});

export type DevelopmentBlueprint = z.infer<typeof DevelopmentBlueprintSchema>;
export type BlueprintStep = z.infer<typeof BlueprintStepSchema>;