/**
 * Command Base Class
 * Abstract base for all CLI commands following the Command pattern
 */

import type {
  CLIOptions,
  CommandResult,
  CommandContext,
  ProjectSnapshot
} from '../types/index.js';
import { printError, printOutput } from './output.js';

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface JrefPlugin {
  name: string;
  version: string;
  register: (registry: CommandRegistry) => void;
}

export abstract class Command {
  abstract readonly definition: CommandDefinition;

  /**
   * Execute the command with given arguments and context
   */
  abstract execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult>;

  /**
   * Parse command-specific arguments
   */
  protected abstract parseArgs(args: string[], context?: CommandContext): Record<string, unknown>;

  /**
   * Get the snapshot from context, loading if necessary
   */
  protected async getSnapshot(context: CommandContext): Promise<ProjectSnapshot> {
    if (context.snapshot) {
      return context.snapshot;
    }

    const { loadSnapshot } = await import('./streaming-json.js');
    const snapshot = await loadSnapshot(context.stdin);
    return snapshot;
  }

  /**
   * Format and print command result
   */
  protected print(
    data: unknown,
    options: CLIOptions
  ): void {
    printOutput(data, options);
  }

  /**
   * Print error and return error result
   */
  protected error(
    message: string,
    options: CLIOptions,
    exitCode: 1 | 2 = 1
  ): CommandResult {
    printError(message, options);
    return {
      success: false,
      exitCode,
      error: message
    };
  }

  /**
   * Create success result
   */
  protected success(output?: string): CommandResult {
    return {
      success: true,
      exitCode: 0,
      output
    };
  }

  /**
   * Print help for this command
   */
  printHelp(options: CLIOptions = {}): void {
    const { name, description, usage, examples } = this.definition;

    if (options.json) {
      this.print({
        command: name,
        description,
        usage,
        examples
      }, options);
      return;
    }

    console.log(`\n${name.toUpperCase()} COMMAND`);
    console.log('='.repeat(50));
    console.log(`\nDescription: ${description}`);
    console.log(`\nUsage: ${usage}`);
    console.log('\nExamples:');
    for (const example of examples) {
      console.log(`  ${example}`);
    }
    console.log();
  }
}

/**
 * Command Registry
 * Manages registration and lookup of available commands
 */
export class CommandRegistry {
  private commands = new Map<string, Command>();

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.definition.name, command);
  }

  /**
   * Get a command by name
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all registered command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Check if command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get all commands with their definitions
   */
  getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values()).map((cmd) => cmd.definition);
  }
}

// Global registry instance
export const registry = new CommandRegistry();

import { readdirSync, existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * Load plugins from a directory
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
 * Register all built-in commands
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
}