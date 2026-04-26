#!/usr/bin/env node
/**
 * jref CLI - Main Entry Point
 * Optimized Development Prompt CLI tool for interacting with JSON project snapshots
 * Designed for both human developers and AI agents
 */
import { registerBuiltinCommands, registry, loadPlugins } from './utils/command.js';
import { readFromInput, isStdinPiped } from './utils/input.js';
import { printError, printHeader, exit } from './utils/output.js';
import { join } from 'path';
const VERSION = '1.2.0';
/**
 * Parse global CLI options
 */
function parseGlobalOptions(args) {
    const options = {};
    const remainingArgs = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--json' || arg === '-j') {
            options.json = true;
        }
        else if (arg === '--silent' || arg === '-s') {
            options.silent = true;
        }
        else if (arg === '--raw' || arg === '-r') {
            options.raw = true;
        }
        else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
        else if (arg === '--version' || arg === '-v') {
            options.version = true;
        }
        else if (arg === '--jq' || arg === '-q') {
            if (i + 1 < args.length) {
                options.jq = args[++i];
            }
        }
        else {
            remainingArgs.push(arg);
        }
    }
    return { remainingArgs, options };
}
/**
 * Print global help
 */
function printGlobalHelp(options = {}) {
    if (options.json) {
        console.log(JSON.stringify({
            name: 'jref',
            version: VERSION,
            description: 'CLI tool to interact with JSON project snapshots',
            commands: registry.getAllCommands()
        }));
        return;
    }
    printHeader(options);
    console.log('USAGE:\n');
    console.log('  jref <command> [options] [file]');
    console.log('  cat snapshot.json | jref <command> [options]');
    console.log();
    console.log('COMMANDS:\n');
    for (const cmd of registry.getAllCommands()) {
        console.log(`  ${cmd.name.padEnd(14)} ${cmd.description}`);
    }
    console.log();
    console.log('GLOBAL OPTIONS:\n');
    console.log('  --json, -j      Output in JSON format (for AI agents)');
    console.log('  --silent, -s    Suppress all progress and decorative output');
    console.log('  --raw, -r       Raw output mode (no formatting, for AI agents)');
    console.log('  --jq, -q <f>    Apply a jq filter to reshape the snapshot before execution');
    console.log('  --help, -h      Show this help message');
    console.log('  --version       Show version information');
    console.log();
    console.log('EXAMPLES:\n');
    console.log('  # View snapshot metadata');
    console.log('  jref inspect snapshot.json');
    console.log();
    console.log('  # Search for a pattern');
    console.log('  jref search "function" snapshot.json');
    console.log();
    console.log('  # Extract specific files');
    console.log('  jref extract --paths src/main.ts snapshot.json');
    console.log();
    console.log('  # Query a specific file (AI-friendly)');
    console.log('  jref query --path "src/main.ts" --raw snapshot.json');
    console.log();
    console.log('  # Check if local directory matches snapshot');
    console.log('  jref reconstruct --directory ./my-project snapshot.json');
    console.log();
    console.log('  # Pipe input support');
    console.log('  cat snapshot.json | jref inspect');
    console.log('  cat snapshot.json | jref search "TODO"');
    console.log();
    console.log('For more information about a command, run: jref <command> --help');
    console.log();
}
/**
 * Print version
 */
function printVersion(options = {}) {
    if (options.json) {
        console.log(JSON.stringify({ version: VERSION }));
    }
    else {
        console.log(`jref v${VERSION}`);
    }
}
/**
 * Main CLI handler
 */
async function main() {
    // Register commands first so parseGlobalOptions knows what the commands are
    await registerBuiltinCommands();
    const args = process.argv.slice(2);
    // Parse global options
    const { remainingArgs, options } = parseGlobalOptions(args);
    // Load plugins from local directory
    try {
        await loadPlugins(join(process.cwd(), '.jref/plugins'));
    }
    catch (err) {
        // Ignore plugin loading errors
    }
    // Handle version flag
    if (options.version) {
        printVersion(options);
        exit(0);
        return;
    }
    // Handle global help flag or no args
    if (options.help || remainingArgs.length === 0) {
        printGlobalHelp(options);
        exit(0);
        return;
    }
    // Get command name
    const commandName = remainingArgs[0];
    const commandArgs = remainingArgs.slice(1);
    // Find command
    const command = registry.get(commandName);
    if (!command) {
        printError(`Unknown command: ${commandName}`, options);
        console.log(`Run 'jref --help' for available commands.`);
        exit(1);
        return;
    }
    // Handle help for specific command
    if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
        command.printHelp(options);
        exit(0);
        return;
    }
    // Check for stdin input
    const stdinIsPipe = isStdinPiped();
    let stdinData = '';
    // DON'T consume stdin if we're running the serve command,
    // as it needs stdin to remain open for the MCP protocol.
    if (stdinIsPipe && commandName !== 'serve') {
        stdinData = await readFromInput();
    }
    // Create command context
    const context = {
        stdin: stdinData,
        stdinIsPipe
    };
    // Execute command
    try {
        const result = await command.execute(commandArgs, options, context);
        if (result.output) {
            process.stdout.write(result.output + '\n');
        }
        exit(result.exitCode);
    }
    catch (err) {
        printError(`Fatal error: ${err.message}`, options);
        exit(1);
    }
}
// Export for testing
export { main, registerBuiltinCommands, registry };
// Run if executed directly
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map