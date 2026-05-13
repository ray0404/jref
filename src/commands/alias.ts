import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { loadAliasConfig, saveAliasConfig } from '../utils/alias.js';

export class AliasCommand extends Command {
  readonly definition = {
    name: 'alias',
    description: 'Manage command aliases',
    usage: 'jref alias <subcommand> [options]',
    options: [
      {
        flags: '--global, -g',
        description: 'Use global configuration (~/.jref/config.json)'
      },
      {
        flags: '--local, -l',
        description: 'Use local configuration (./.jref/config.json)'
      }
    ],
    examples: [
      'jref alias set l inspect',
      'jref alias set la inspect --all',
      'jref alias list',
      'jref alias remove l',
      'jref alias set s search --global'
    ],
    workflows: [
      'Set Alias: Create a shorthand for a long command sequence.',
      'Remove Alias: Delete an existing shorthand.',
      'List Aliases: View all currently defined aliases and their expansions.',
      'Scope Management: Use --global for cross-project aliases or --local for project-specific ones.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { subcommand, aliasName, expansion, isGlobal } = this.parseArgs(args);

      if (!subcommand) {
        return this.error('Missing subcommand. Use "set", "remove", or "list".', options);
      }

      const config = loadAliasConfig();

      switch (subcommand) {
        case 'set':
          if (!aliasName || expansion.length === 0) {
            return this.error('Usage: jref alias set <name> <command...>', options);
          }
          config[aliasName] = expansion;
          saveAliasConfig(config, isGlobal);
          return this.success(`Alias '${aliasName}' set to '${expansion.join(' ')}' (${isGlobal ? 'global' : 'local'})`);

        case 'remove':
          if (!aliasName) {
            return this.error('Usage: jref alias remove <name>', options);
          }
          if (!config[aliasName]) {
            return this.error(`Alias '${aliasName}' not found.`, options);
          }
          delete config[aliasName];
          saveAliasConfig(config, isGlobal);
          return this.success(`Alias '${aliasName}' removed (${isGlobal ? 'global' : 'local'})`);

        case 'list':
          if (Object.keys(config).length === 0) {
            return this.success('No aliases defined.');
          }
          if (options.json) {
            this.print(config, options);
          } else {
            console.log('\nDEFINED ALIASES:');
            console.log('─'.repeat(40));
            for (const [name, expanded] of Object.entries(config)) {
              console.log(`  ${name.padEnd(12)} -> ${expanded.join(' ')}`);
            }
            console.log();
          }
          return this.success();

        default:
          return this.error(`Unknown subcommand: ${subcommand}`, options);
      }
    } catch (err) {
      return this.error(`Alias command failed: ${(err as Error).message}`, options, 1);
    }
  }

  protected parseArgs(args: string[]): {
    subcommand?: string;
    aliasName?: string;
    expansion: string[];
    isGlobal: boolean;
  } {
    let subcommand: string | undefined;
    let aliasName: string | undefined;
    const expansion: string[] = [];
    let isGlobal = false;

    const filteredArgs = args.filter(arg => {
      if (arg === '--global' || arg === '-g') {
        isGlobal = true;
        return false;
      }
      if (arg === '--local' || arg === '-l') {
        isGlobal = false;
        return false;
      }
      return true;
    });

    if (filteredArgs.length > 0) {
      subcommand = filteredArgs[0];
    }

    if (filteredArgs.length > 1) {
      aliasName = filteredArgs[1];
    }

    if (filteredArgs.length > 2) {
      expansion.push(...filteredArgs.slice(2));
    }

    return { subcommand, aliasName, expansion, isGlobal };
  }
}
