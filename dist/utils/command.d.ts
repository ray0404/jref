/**
 * Command Base Class
 * Abstract base for all CLI commands following the Command pattern
 */
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
export interface CommandOption {
    flags: string;
    description: string;
    defaultValue?: any;
}
export interface CommandDefinition {
    name: string;
    description: string;
    usage: string;
    options: CommandOption[];
    examples: string[];
    workflows?: string[];
}
export interface JrefPlugin {
    name: string;
    version: string;
    register: (registry: CommandRegistry) => void;
}
export declare abstract class Command {
    abstract readonly definition: CommandDefinition;
    /**
     * Execute the command with given arguments and context
     */
    abstract execute(args: string[], options: CLIOptions, context: CommandContext): Promise<CommandResult>;
    /**
     * Parse command-specific arguments
     */
    protected abstract parseArgs(args: string[], context?: CommandContext): Record<string, unknown>;
    /**
     * Get the snapshot from context, loading if necessary
     */
    protected getSnapshot(context: CommandContext, options?: CLIOptions, filePath?: string): Promise<ProjectSnapshot>;
    /**
     * Format and print command result
     */
    protected print(data: unknown, options: CLIOptions): void;
    /**
     * Print error and return error result
     */
    protected error(message: string, options: CLIOptions, exitCode?: 1 | 2): CommandResult;
    /**
     * Create success result
     */
    protected success(output?: string): CommandResult;
    /**
     * Print help for this command
     */
    printHelp(options?: CLIOptions): void;
}
/**
 * Command Registry
 * Manages registration and lookup of available commands
 */
export declare class CommandRegistry {
    private commands;
    /**
     * Register a command
     */
    register(command: Command): void;
    /**
     * Get a command by name
     */
    get(name: string): Command | undefined;
    /**
     * Get all registered command names
     */
    getCommandNames(): string[];
    /**
     * Check if command exists
     */
    has(name: string): boolean;
    /**
     * Get all commands with their definitions
     */
    getAllCommands(): CommandDefinition[];
}
export declare const registry: CommandRegistry;
/**
 * Load plugins from a directory
 */
export declare function loadPlugins(pluginDir: string): Promise<void>;
/**
 * Register all built-in commands
 */
export declare function registerBuiltinCommands(): Promise<void>;
//# sourceMappingURL=command.d.ts.map