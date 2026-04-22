import { z } from 'zod';

/**
 * Project Snapshot Schema Types
 * Represents the structure of a condensed JSON project snapshot
 */

export const ProjectSnapshotSchema = z.object({
  directoryStructure: z.string().optional(),
  files: z.record(z.string(), z.string()),
  instruction: z.string().optional(),
  fileSummary: z.string().optional(),
  userProvidedHeader: z.string().optional(),
});

export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;

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
}

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