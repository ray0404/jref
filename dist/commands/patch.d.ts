import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
export declare class PatchCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: Record<string, unknown>;
        filePath?: string;
        content?: string;
        snapshotFile?: string;
    };
}
//# sourceMappingURL=patch.d.ts.map