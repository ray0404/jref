/**
 * Project Snapshot Schema Types
 * Represents the structure of a condensed JSON project snapshot
 */

export interface ProjectSnapshot {
  directoryStructure: string;
  files: Record<string, string>;
  instruction?: string;
  fileSummary?: string;
  userProvidedHeader?: string;
}

export interface SnapshotMetadata {
  fileCount: number;
  totalSize: number;
  hasInstruction: boolean;
  hasFileSummary: boolean;
  hasUserProvidedHeader: boolean;
  directoryStructureLines: number;
}

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