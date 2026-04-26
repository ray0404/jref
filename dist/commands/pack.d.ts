/**
 * Pack Command
 * Create a snapshot from a local directory using Repomix programmatic API
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface PackFlags {
    instruction?: string;
    summary?: string;
    maxSize?: number;
}
export declare class PackCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, _context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: PackFlags;
        targetDir?: string;
    };
}
export {};
//# sourceMappingURL=pack.d.ts.map