/**
 * Extract Command
 * Unpack specific files, directories, or entire project back into local filesystem
 * Supports streaming for large snapshots and wildcard pattern matching
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface ExtractFlags {
    outputDir?: string;
    patterns?: string[];
    overwrite?: boolean;
    dryRun?: boolean;
    flat?: boolean;
}
export declare class ExtractCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[], context?: CommandContext): {
        flags: ExtractFlags;
        filePath?: string;
    };
    private extractFile;
    private outputDryRun;
    private outputResults;
    private formatBytes;
}
export {};
//# sourceMappingURL=extract.d.ts.map