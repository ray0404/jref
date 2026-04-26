import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
export declare class ServeCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        snapshotFile?: string;
    };
}
//# sourceMappingURL=serve.d.ts.map