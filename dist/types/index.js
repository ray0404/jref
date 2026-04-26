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
export const SnapshotMetadataSchema = z.object({
    fileCount: z.number(),
    totalSize: z.number(),
    hasInstruction: z.boolean(),
    hasFileSummary: z.boolean(),
    hasUserProvidedHeader: z.boolean(),
    directoryStructureLines: z.number(),
});
//# sourceMappingURL=index.js.map