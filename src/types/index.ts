import { z } from 'zod';

/**
 * @module Types
 * Core data models and schemas for the jref project.
 * Contains Zod schemas for runtime validation and inferred TypeScript types
 * for static analysis.
 */

/**
 * Represents a logical block of code identified during semantic analysis.
 */
export interface CodeChunk {
  /**
   * Relative path to the file containing the chunk.
   */
  filePath: string;
  /**
   * Starting line number of the chunk (1-based).
   */
  startLine: number;
  /**
   * Ending line number of the chunk (inclusive).
   */
  endLine: number;
  /**
   * The logical category of the code block.
   */
  type: 'function' | 'class' | 'method' | 'block';
  /**
   * The identifier name of the chunk (e.g., function name), if applicable.
   */
  name?: string;
  /**
   * The raw source code content of the chunk.
   */
  content: string;
  /**
   * Vector embedding for RAG/semantic search retrieval.
   */
  embedding?: number[];
}

/**
 * Runtime schema for ProjectSnapshot validation.
 */
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

/**
 * A condensed, JSON-serializable representation of a project.
 * This is the primary data exchange format for AI agent interactions.
 */
export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;

/**
 * Runtime schema for GraphNode validation.
 */
export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['code', 'doc', 'concept', 'binary']),
  source_file: z.string(),
  source_location: z.string().optional(),
  community: z.number().int().optional(),
});

/**
 * Represents a single node (vertex) in the knowledge graph.
 */
export type GraphNode = z.infer<typeof GraphNodeSchema>;

/**
 * Runtime schema for GraphEdge validation.
 */
export const GraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string(),
  confidence: z.enum(['EXTRACTED', 'INFERRED', 'AMBIGUOUS']),
  weight: z.number().default(1.0),
});

/**
 * Represents a relationship (edge) between two nodes in the knowledge graph.
 */
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

/**
 * Runtime schema for GraphSnapshot validation.
 */
export const GraphSnapshotSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

/**
 * A complete representation of a codebase's symbol relationships and topology.
 */
export type GraphSnapshot = z.infer<typeof GraphSnapshotSchema>;

/**
 * Runtime schema for SnapshotMetadata validation.
 */
export const SnapshotMetadataSchema = z.object({
  fileCount: z.number(),
  totalSize: z.number(),
  hasInstruction: z.boolean(),
  hasRoadmap: z.boolean(),
  hasFileSummary: z.boolean(),
  hasUserProvidedHeader: z.boolean(),
  directoryStructureLines: z.number(),
});

/**
 * Qualitative and quantitative metadata about a ProjectSnapshot.
 */
export type SnapshotMetadata = z.infer<typeof SnapshotMetadataSchema>;

/**
 * Result of a file search operation.
 */
export interface SearchResult {
  /**
   * Path to the file where matches were found.
   */
  filePath: string;
  /**
   * List of specific matches within the file.
   */
  matches: SearchMatch[];
  /**
   * Relevance score for the search result.
   */
  score: number;
}

/**
 * A single match within a file during a search operation.
 */
export interface SearchMatch {
  /**
   * Line number of the match (1-based).
   */
  line: number;
  /**
   * Content of the line containing the match.
   */
  content: string;
  /**
   * Starting character index of the match within the line.
   */
  startIndex: number;
  /**
   * Ending character index of the match.
   */
  endIndex: number;
}

/**
 * Options for extracting files from a snapshot to the local filesystem.
 */
export interface ExtractOptions {
  /**
   * Destination directory for extracted files.
   */
  outputDir: string;
  /**
   * Optional array of specific paths to extract.
   */
  paths?: string[];
  /**
   * Whether to overwrite existing files.
   */
  overwrite?: boolean;
  /**
   * Whether to attempt to preserve file permissions (if available).
   */
  preservePermissions?: boolean;
}

/**
 * Result of a reconstruction validation check.
 */
export interface ReconstructResult {
  /**
   * Whether the snapshot perfectly matches the filesystem.
   */
  matches: boolean;
  /**
   * Files present in the snapshot but missing from the disk.
   */
  missingFiles: string[];
  /**
   * Files present on disk but missing from the snapshot.
   */
  extraFiles: string[];
  /**
   * Files present in both but with differing content.
   */
  modifiedFiles: string[];
  /**
   * Total number of files compared.
   */
  totalChecked: number;
}

/**
 * Options for the `query` command/API.
 */
export interface QueryOptions {
  /**
   * Target file path.
   */
  path: string;
  /**
   * Whether to return raw content without decorative headers.
   */
  raw?: boolean;
}

/**
 * Common global CLI options/flags.
 */
export interface CLIOptions {
  /**
   * Enable machine-readable JSON output.
   */
  json?: boolean;
  /**
   * Suppress all decorative output and progress indicators.
   */
  silent?: boolean;
  /**
   * Emit pure file content without metadata headers.
   */
  raw?: boolean;
  /**
   * Display help information.
   */
  help?: boolean;
  /**
   * Display version information.
   */
  version?: boolean;
  /**
   * Apply a JQ filter to the JSON result.
   */
  jq?: string;
  /**
   * Launch the interactive React TUI.
   */
  ui?: boolean;
}

/**
 * Runtime schema for persistent jref configuration settings.
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

/**
 * Persistent configuration settings for the jref CLI.
 */
export type JrefConfig = z.infer<typeof JrefConfigSchema>;

/**
 * Execution context for CLI commands.
 */
export interface CommandContext {
  /**
   * Content received from stdin.
   */
  stdin?: string;
  /**
   * Whether stdin is being piped from another process.
   */
  stdinIsPipe: boolean;
  /**
   * Pre-loaded ProjectSnapshot for optimized command execution.
   */
  snapshot?: ProjectSnapshot;
  /**
   * Pre-calculated metadata for the active snapshot.
   */
  metadata?: SnapshotMetadata;
  /**
   * Custom output handler for redirecting prints.
   */
  outputHandler?: (data: string, type: 'stdout' | 'stderr') => void;
}

/**
 * Valid exit codes for CLI commands.
 */
export type CommandExitCode = 0 | 1 | 2;

/**
 * Unified result structure for all CLI command executions.
 */
export interface CommandResult<T = any> {
  /**
   * Whether the command completed successfully.
   */
  success: boolean;
  /**
   * The process exit code.
   */
  exitCode: CommandExitCode;
  /**
   * Human-readable output string.
   */
  output?: string;
  /**
   * Structured data payload.
   */
  data?: T;
  /**
   * Error message if success is false.
   */
  error?: string;
}

/**
 * Runtime schema for Command Alias configuration.
 */
export const AliasConfigSchema = z.record(z.string(), z.array(z.string()));

/**
 * Map of custom command aliases to their expansions.
 */
export type AliasConfig = z.infer<typeof AliasConfigSchema>;

/**
 * Development Blueprint Schema Types
 * Refined structure for tracking features, bugs, and architectural changes.
 */

/**
 * Metadata for a development blueprint.
 */
export const BlueprintMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'ARCHIVED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  complexity: z.number().min(1).max(10).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Formal specification for a blueprint task.
 */
export const BlueprintSpecSchema = z.object({
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
});

/**
 * Structural context for a blueprint (files, symbols, dependencies).
 */
export const BlueprintContextSchema = z.object({
  targetFiles: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  externalRefs: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).optional(),
});

/**
 * A single step in a blueprint implementation plan.
 */
export const BlueprintStepSchema = z.object({
  id: z.string(),
  task: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  tdd: z.boolean().default(false),
  notes: z.string().optional(),
});

/**
 * Implementation strategy and steps for a blueprint.
 */
export const BlueprintImplementationSchema = z.object({
  strategy: z.string(),
  steps: z.array(BlueprintStepSchema),
});

/**
 * Verification checklist and test suites for a blueprint.
 */
export const BlueprintVerificationSchema = z.object({
  unitTests: z.array(z.string()).optional(),
  integrationTests: z.array(z.string()).optional(),
  manualChecklist: z.array(z.object({
    item: z.string(),
    passed: z.boolean(),
  })).optional(),
});

/**
 * Runtime schema for the overall Development Blueprint.
 */
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

/**
 * A formal feature/bug implementation plan.
 * Used by the `conductor` extension to manage complex workflows.
 */
export type DevelopmentBlueprint = z.infer<typeof DevelopmentBlueprintSchema>;

/**
 * A discrete unit of work within an implementation plan.
 */
export type BlueprintStep = z.infer<typeof BlueprintStepSchema>;