/**
 * Inspect Command
 * Views directoryStructure and metadata without loading entire file into memory
 * Supports streaming for large JSON snapshots
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
export declare class InspectCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: Record<string, unknown>;
        filePath?: string;
    };
    private printMetadata;
    private printStructure;
    private printFileList;
    private printSummary;
    private formatBytes;
}
//# sourceMappingURL=inspect.d.ts.map