import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
export declare class DiffCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    private findExtraFiles;
    private printHumanDiff;
    protected parseArgs(args: string[]): {
        flags: Record<string, unknown>;
        snapshotFile?: string;
    };
}
//# sourceMappingURL=diff.d.ts.map