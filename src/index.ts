#!/usr/bin/env node
/**
 * jref CLI - Main Entry Point
 * Optimized Development Prompt CLI tool for interacting with JSON project snapshots
 * Designed for both human developers and AI agents
 */

import { registerBuiltinCommands, registry, loadPlugins } from './utils/command.js';
import { readFromInput, isStdinPiped } from './utils/input.js';
import { printError, printHeader, exit } from './utils/output.js';
import type { CLIOptions, CommandContext } from './types/index.js';
import { join } from 'path';

const VERSION = '1.0.0';

/**
 * Parse global CLI options
 */
function parseGlobalOptions(args: string[]): {
  remainingArgs: string[];
  options: CLIOptions;
} {
  const options: CLIOptions = {};
  const remainingArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--json':
      case '-j':
        options.json = true;
        break;
      case '--silent':
      case '-s':
        options.silent = true;
        break;
      case '--raw':
      case '-r':
        options.raw = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--version':
      case '-v':
        options.version = true;
        break;
      default:
        remainingArgs.push(arg);
    }
  }

  return { remainingArgs, options };
}

/**
 * Print global help
 */
function printGlobalHelp(options: CLIOptions = {}): void {
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
function printVersion(options: CLIOptions = {}): void {
  if (options.json) {
    console.log(JSON.stringify({ version: VERSION }));
  } else {
    console.log(`jref v${VERSION}`);
  }
}

/**
 * Main CLI handler
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Parse global options
  const { remainingArgs, options } = parseGlobalOptions(args);

  // Register commands
  await registerBuiltinCommands();

  // Load plugins from local directory
  try {
    await loadPlugins(join(process.cwd(), '.jref/plugins'));
  } catch (err) {
    // Ignore plugin loading errors
  }

  // Handle version flag
  if (options.version) {
    printVersion(options);
    exit(0);
    return;
  }

  // Handle help flag
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

  if (stdinIsPipe) {
    stdinData = await readFromInput();
  }

  // Create command context
  const context: CommandContext = {
    stdin: stdinData,
    stdinIsPipe
  };

  // Execute command
  try {
    const result = await command.execute(commandArgs, options, context);
    exit(result.exitCode);
  } catch (err) {
    printError(`Fatal error: ${(err as Error).message}`, options);
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
