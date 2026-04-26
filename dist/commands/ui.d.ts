/**
 * UI Command
 * Interactive Terminal User Interface for browsing project snapshots
 * Designed for mobile/Termux users who find typing long file paths tedious
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface UIFlags {
    help?: boolean;
}
export declare class UICommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: UIFlags;
        filePath?: string;
    };
    private readFile;
}
export {};
//# sourceMappingURL=ui.d.ts.map