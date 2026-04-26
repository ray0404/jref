import { z } from 'zod';
/**
 * Project Snapshot Schema Types
 * Represents the structure of a condensed JSON project snapshot
 */
export declare const ProjectSnapshotSchema: z.ZodObject<{
    directoryStructure: z.ZodOptional<z.ZodString>;
    files: z.ZodRecord<z.ZodString, z.ZodString>;
    instruction: z.ZodOptional<z.ZodString>;
    fileSummary: z.ZodOptional<z.ZodString>;
    userProvidedHeader: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;
export declare const SnapshotMetadataSchema: z.ZodObject<{
    fileCount: z.ZodNumber;
    totalSize: z.ZodNumber;
    hasInstruction: z.ZodBoolean;
    hasFileSummary: z.ZodBoolean;
    hasUserProvidedHeader: z.ZodBoolean;
    directoryStructureLines: z.ZodNumber;
}, z.core.$strip>;
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
//# sourceMappingURL=index.d.ts.map