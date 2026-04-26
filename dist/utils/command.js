/**
 * Command Base Class
 * Abstract base for all CLI commands following the Command pattern
 */
import { printError, printOutput } from './output.js';
export class Command {
    /**
     * Get the snapshot from context, loading if necessary
     */
    async getSnapshot(context, options, filePath) {
        if (context.snapshot) {
            return context.snapshot;
        }
        const { loadSnapshot, loadSnapshotFromFile } = await import('./streaming-json.js');
        if (filePath) {
            return await loadSnapshotFromFile(filePath, options);
        }
        const snapshot = await loadSnapshot(context.stdin, options);
        return snapshot;
    }
    /**
     * Format and print command result
     */
    print(data, options) {
        printOutput(data, options);
    }
    /**
     * Print error and return error result
     */
    error(message, options, exitCode = 1) {
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
    success(output) {
        return {
            success: true,
            exitCode: 0,
            output
        };
    }
    /**
     * Print help for this command
     */
    printHelp(options = {}) {
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
 * Command Registry
 * Manages registration and lookup of available commands
 */
export class CommandRegistry {
    commands = new Map();
    /**
     * Register a command
     */
    register(command) {
        this.commands.set(command.definition.name, command);
    }
    /**
     * Get a command by name
     */
    get(name) {
        return this.commands.get(name);
    }
    /**
     * Get all registered command names
     */
    getCommandNames() {
        return Array.from(this.commands.keys());
    }
    /**
     * Check if command exists
     */
    has(name) {
        return this.commands.has(name);
    }
    /**
     * Get all commands with their definitions
     */
    getAllCommands() {
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
export async function loadPlugins(pluginDir) {
    if (!existsSync(pluginDir))
        return;
    const entries = readdirSync(pluginDir);
    for (const entry of entries) {
        if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
            try {
                const pluginPath = pathResolve(pluginDir, entry);
                const pluginUrl = pathToFileURL(pluginPath).href;
                const module = await import(pluginUrl);
                const plugin = (module.default || module);
                if (plugin.name && typeof plugin.register === 'function') {
                    plugin.register(registry);
                    // console.error(`✅ Plugin loaded: ${plugin.name} v${plugin.version || '0.0.0'}`);
                }
            }
            catch (err) {
                console.error(`❌ Failed to load plugin ${entry}: ${err.message}`);
            }
        }
    }
}
/**
 * Register all built-in commands
 */
export async function registerBuiltinCommands() {
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
//# sourceMappingURL=command.js.map