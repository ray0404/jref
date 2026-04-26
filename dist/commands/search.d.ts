/**
 * Search Command
 * High-speed regex or keyword searching across all entries in the files object
 * Supports streaming for large JSON snapshots
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface SearchFlags {
    regex?: boolean;
    caseInsensitive?: boolean;
    filesOnly?: boolean;
    maxResults?: number;
    context?: number;
}
export declare class SearchCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        pattern?: string;
        flags: SearchFlags;
        filePath?: string;
    };
    private createRegex;
    private searchContent;
    private outputResults;
    private highlightMatch;
}
export {};
//# sourceMappingURL=search.d.ts.map