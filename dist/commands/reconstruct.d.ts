/**
 * Reconstruct Command
 * Dry-run/check mode to verify if a local directory matches the snapshot
 * Compares local files against the snapshot contents
 */
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
interface ReconstructFlags {
    directory?: string;
    verbose?: boolean;
    ignoreMissing?: boolean;
    ignoreExtra?: boolean;
}
export declare class ReconstructCommand extends Command {
    readonly definition: CommandDefinition;
    execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    protected parseArgs(args: string[]): {
        flags: ReconstructFlags;
        filePath?: string;
    };
    private readFile;
    private directoryExists;
    private compareWithSnapshot;
    private collectLocalFiles;
    private shouldIgnore;
    private outputResults;
}
export {};
//# sourceMappingURL=reconstruct.d.ts.map