/**
 * Query Command
 * Retrieve content of a specific file path from the snapshot
 * Designed for AI agent usage with --raw flag support
 * Supports streaming for large JSON snapshots
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface QueryFlags {
    path?: string;
    raw?: boolean;
    lineStart?: number;
    lineEnd?: number;
}
export declare class QueryCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: QueryFlags;
        filePath?: string;
    };
    private extractLineRange;
    private outputContent;
    private formatBytes;
}
export {};
//# sourceMappingURL=query.d.ts.map