/**
 * Run Command
 * Executes a script directly from the JSON snapshot without permanent extraction
 * Supports Node.js scripts and any other executable scripts with shebangs
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface RunFlags {
    path?: string;
    args?: string[];
}
export declare class RunCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: RunFlags;
        filePath?: string;
        scriptArgs: string[];
    };
    private spawnProcess;
}
export {};
//# sourceMappingURL=run.d.ts.map