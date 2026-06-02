/**
 * @module Command
 * Foundational Command pattern implementation for the jref CLI.
 */

import type {
  CLIOptions,
  CommandResult,
  CommandContext,
  ProjectSnapshot
} from '../types/index.js';
import { 
  printError, 
  printOutput, 
  printSuccess, 
  printWarning, 
  printInfo, 
  printProgress 
} from './output.js';

/**
 * Represents a single CLI option for a command.
 */
export interface CommandOption {
  /**
   * The flags used to invoke this option (e.g., "-f, --file <path>").
   */
  flags: string;
  /**
   * A short description of what the option does.
   */
  description: string;
  /**
   * The default value for the option if not provided.
   */
  defaultValue?: any;
}

/**
 * Metadata definition for a CLI command.
 */
export interface CommandDefinition {
  /**
   * The unique name of the command.
   */
  name: string;
  /**
   * A brief description of the command's purpose.
   */
  description: string;
  /**
   * Usage string showing how to call the command.
   */
  usage: string;
  /**
   * List of supported options/flags.
   */
  options: CommandOption[];
  /**
   * Examples demonstrating common usage patterns.
   */
  examples: string[];
  /**
   * Optional list of high-level workflows this command supports.
   */
  workflows?: string[];
}

/**
 * Interface for jref plugins that extend the CLI.
 */
export interface JrefPlugin {
  /**
   * The display name of the plugin.
   */
  name: string;
  /**
   * Semantic version of the plugin.
   */
  version: string;
  /**
   * Registration callback to add commands to the registry.
   * @param registry - The global command registry instance.
   */
  register: (registry: CommandRegistry) => void;
}

/**
 * Abstract base class for all CLI commands.
 * Implements the Command pattern and provides utility methods for output and data retrieval.
 */
export abstract class Command {
  /**
   * The metadata definition for the command.
   */
  abstract readonly definition: CommandDefinition;

  /**
   * Core execution logic for the command.
   * @param args - Positional arguments passed to the command.
   * @param options - Parsed global and command-specific options.
   * @param context - Execution context including environment state and active snapshot.
   * @returns A promise resolving to the result of the command execution.
   */
  abstract execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult>;

  /**
   * Parses positional arguments into a structured record.
   * @param args - Raw positional arguments.
   * @param context - Optional execution context.
   * @returns A map of parsed argument names to their values.
   */
  protected abstract parseArgs(args: string[], context?: CommandContext): Record<string, unknown>;

  /**
   * Retrieves generic JSON data from the context, a file, or stdin.
   * Supports JSON5 for lenient parsing.
   * @param context - Execution context.
   * @param _options - Optional CLI options.
   * @param filePath - Optional path to a JSON file. Use '-' for stdin.
   * @returns A promise resolving to the parsed JSON data.
   * @throws Error if file reading or JSON parsing fails.
   */
  protected async getJSON(context: CommandContext, _options?: CLIOptions, filePath?: string): Promise<any> {
    if (context.snapshot) {
      return context.snapshot;
    }

    const { readFromInput } = await import('./input.js');
    let data = '';

    if (filePath && filePath !== '-') {
      const { readFileSync } = await import('fs');
      data = readFileSync(filePath, 'utf8');
    } else if (context.stdinIsPipe || context.stdin) {
      data = context.stdin || await readFromInput();
    } else {
      return {};
    }

    if (!data.trim()) return {};

    try {
      return JSON.parse(data);
    } catch {
      const JSON5 = (await import('json5')).default;
      return JSON5.parse(data); // If it fails, it throws
    }
  }

  /**
   * Loads a ProjectSnapshot from context, file, or stdin.
   * Uses streaming JSON processing for efficiency.
   * @param context - Execution context.
   * @param options - CLI options (e.g., for schema validation).
   * @param filePath - Optional path to the snapshot file.
   * @returns A promise resolving to the loaded ProjectSnapshot.
   */
  protected async getSnapshot(context: CommandContext, options?: CLIOptions, filePath?: string): Promise<ProjectSnapshot> {
    if (context.snapshot) {
      return context.snapshot;
    }

    const { loadSnapshot, loadSnapshotFromFile } = await import('./streaming-json.js');
    
    if (filePath && filePath !== '-') {
      return await loadSnapshotFromFile(filePath, options);
    }

    if (!context.stdinIsPipe && !context.stdin) {
      // Return a minimal valid snapshot if no input is provided
      return { files: {}, directoryStructure: '' };
    }

    const snapshot = await loadSnapshot(context.stdin, options);
    return snapshot;
  }

  /**
   * Prints data to the configured output handler (stdout or custom).
   * Handles JSON formatting if requested in options.
   * @param data - The data to print.
   * @param options - CLI options.
   * @param context - Optional context for output handler resolution.
   */
  protected print(
    data: unknown,
    options: CLIOptions,
    context?: CommandContext
  ): void {
    printOutput(data, options, context?.outputHandler);
  }

  /**
   * Reports an error to the user and generates a failure CommandResult.
   * @param message - The error message.
   * @param options - CLI options.
   * @param exitCode - Exit code for the failure (defaults to 1).
   * @param context - Optional context for output handler resolution.
   * @returns A failed CommandResult.
   */
  protected error(
    message: string,
    options: CLIOptions,
    exitCode: 1 | 2 = 1,
    context?: CommandContext
  ): CommandResult {
    printError(message, options, context?.outputHandler);
    return {
      success: false,
      exitCode,
      error: message
    };
  }

  /**
   * Prints a success message to the user.
   * Only displays in human-readable mode (no --json/--raw).
   * @param message - Success message.
   * @param options - CLI options.
   * @param context - Optional context.
   */
  protected printSuccess(message: string, options: CLIOptions = {}, context?: CommandContext): void {
    printSuccess(message, options, context?.outputHandler);
  }

  /**
   * Prints a warning message to the user.
   * Only displays in human-readable mode.
   * @param message - Warning message.
   * @param options - CLI options.
   * @param context - Optional context.
   */
  protected printWarning(message: string, options: CLIOptions = {}, context?: CommandContext): void {
    printWarning(message, options, context?.outputHandler);
  }

  /**
   * Prints an informational message to the user.
   * Only displays in human-readable mode.
   * @param message - Information message.
   * @param options - CLI options.
   * @param context - Optional context.
   */
  protected printInfo(message: string, options: CLIOptions = {}, context?: CommandContext): void {
    printInfo(message, options, context?.outputHandler);
  }

  /**
   * Prints a progress indicator or message.
   * @param message - Progress message.
   * @param options - CLI options.
   * @param context - Optional context.
   */
  protected printProgress(message: string, options: CLIOptions = {}, context?: CommandContext): void {
    printProgress(message, options, context?.outputHandler);
  }

  /**
   * Helper to create a successful CommandResult.
   * @param output - Optional human-readable output string.
   * @param data - Optional structured data payload.
   * @returns A successful CommandResult.
   */
  protected success<T = any>(output?: string, data?: T): CommandResult<T> {
    return {
      success: true,
      exitCode: 0,
      output,
      data
    };
  }

  /**
   * Displays the help information for this command.
   * Handles both text and JSON output formats.
   * @param options - CLI options.
   */
  printHelp(options: CLIOptions = {}): void {
    const { name, description, usage, options: cmdOptions, examples, workflows } = this.definition;

    if (options.json) {
      this.print({
        command: name,
        description,
        usage,
        options: cmdOptions,
        examples,
        workflows
      }, options);
      return;
    }

    console.log(`\n${name.toUpperCase()} COMMAND`);
    console.log('='.repeat(50));
    console.log(`\nDescription: ${description}`);
    console.log(`\nUsage: ${usage}`);

    if (cmdOptions && cmdOptions.length > 0) {
      console.log('\nOptions:');
      for (const opt of cmdOptions) {
        const defaultValue = opt.defaultValue !== undefined ? ` (default: ${opt.defaultValue})` : '';
        console.log(`  ${opt.flags.padEnd(25)} ${opt.description}${defaultValue}`);
      }
    }

    if (workflows && workflows.length > 0) {
      console.log('\nDetailed Workflows:');
      for (const workflow of workflows) {
        console.log(`  - ${workflow}`);
      }
    }

    console.log('\nExamples:');
    for (const example of examples) {
      console.log(`  ${example}`);
    }
    console.log();
  }
}

/**
 * Registry for managing and looking up available CLI commands.
 */
export class CommandRegistry {
  private commands = new Map<string, Command>();

  /**
   * Registers a command instance in the registry.
   * @param command - The command to register.
   */
  register(command: Command): void {
    this.commands.set(command.definition.name, command);
  }

  /**
   * Retrieves a command by its name.
   * @param name - The name of the command.
   * @returns The command instance if found, otherwise undefined.
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Returns a list of all registered command names.
   * @returns Array of command names.
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Checks if a command with the given name is registered.
   * @param name - The command name.
   * @returns True if the command exists.
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Returns metadata for all registered commands.
   * @returns Array of CommandDefinitions.
   */
  getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values()).map((cmd) => cmd.definition);
  }
}

/**
 * Global instance of the command registry.
 */
export const registry = new CommandRegistry();

import { readdirSync, existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Dynamically loads and registers plugins from a specified directory.
 * @param pluginDir - The directory path containing plugin files.
 * @returns A promise that resolves when loading is complete.
 */
export async function loadPlugins(pluginDir: string): Promise<void> {
  if (!existsSync(pluginDir)) return;

  const entries = readdirSync(pluginDir);
  for (const entry of entries) {
    if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
      try {
        const pluginPath = pathResolve(pluginDir, entry);
        const pluginUrl = pathToFileURL(pluginPath).href;
        const module = await import(pluginUrl);
        const plugin = (module.default || module) as JrefPlugin;

        if (plugin.name && typeof plugin.register === 'function') {
          plugin.register(registry);
          // console.error(`✅ Plugin loaded: ${plugin.name} v${plugin.version || '0.0.0'}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load plugin ${entry}: ${(err as Error).message}`);
      }
    }
  }
}

/**
 * Registers all core built-in commands with the global registry.
 * This function handles lazy loading of command implementations.
 * @returns A promise that resolves when all commands are registered.
 */
export async function registerBuiltinCommands(): Promise<void> {
  const { InspectCommand } = await import('../commands/inspect.js');
  const { SearchCommand } = await import('../commands/search.js');
  const { ExtractCommand } = await import('../commands/extract.js');
  const { QueryCommand } = await import('../commands/query.js');
  const { ReconstructCommand } = await import('../commands/reconstruct.js');
  const { UICommand } = await import('../commands/ui.js');
  const { PatchCommand } = await import('../commands/patch.js');
  const { ServeCommand } = await import('../commands/serve.js');
  const { DiffCommand } = await import('../commands/diff.js');
  const { PackCommand } = await import('../commands/pack.js');
  const { SummarizeCommand } = await import('../commands/summarize.js');
  const { RunCommand } = await import('../commands/run.js');
  const { BinCommand } = await import('../commands/bin.js');
  const { BinSetupCommand } = await import('../commands/bin-setup.js');
  const { BPackCommand } = await import('../commands/bpack.js');
  const { BExtractCommand } = await import('../commands/bextract.js');
  const { ValidateCommand } = await import('../commands/validate.js');
  const { GraphCommand } = await import('../commands/graph.js');
  const { TopologyCommand } = await import('../commands/topology.js');
  const { AliasCommand } = await import('../commands/alias.js');
  const { ToolCommand } = await import('../commands/tool.js');
  const { GitCommand } = await import('../commands/git.js');
  const { ConfigCommand } = await import('../commands/config.js');
  const { GetCommand } = await import('../commands/get.js');
  const { SetCommand } = await import('../commands/set.js');
  const { FlattenCommand } = await import('../commands/flatten.js');
  const { UnflattenCommand } = await import('../commands/unflatten.js');
  const { ShellCommand } = await import('../commands/shell.js');
  const { MountCommand } = await import('../commands/mount.js');
  const { UMFSCommand } = await import('../commands/umfs.js');

  // Load plugins/built-ins that register themselves
  await import('../plugins/openapi.js');
  await import('../plugins/venice.js');
  await import('../plugins/api.js');

  registry.register(new InspectCommand());
  registry.register(new SearchCommand());
  registry.register(new ExtractCommand());
  registry.register(new QueryCommand());
  registry.register(new ReconstructCommand());
  registry.register(new UICommand());
  registry.register(new PatchCommand());
  registry.register(new ServeCommand());
  registry.register(new DiffCommand());
  registry.register(new PackCommand());
  registry.register(new SummarizeCommand());
  registry.register(new RunCommand());
  registry.register(new BinCommand());
  registry.register(new BinSetupCommand());
  registry.register(new BPackCommand());
  registry.register(new BExtractCommand());
  registry.register(new ValidateCommand());
  registry.register(new GraphCommand());
  registry.register(new TopologyCommand());
  registry.register(new AliasCommand());
  registry.register(new ToolCommand());
  registry.register(new GitCommand());
  registry.register(new ConfigCommand());
  registry.register(new GetCommand());
  registry.register(new SetCommand());
  registry.register(new FlattenCommand());
  registry.register(new UnflattenCommand());
  registry.register(new ShellCommand());
  registry.register(new MountCommand());
  registry.register(new UMFSCommand());
}