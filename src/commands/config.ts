import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, JrefConfig } from '../types/index.js';
import { loadConfig, saveConfig, DEFAULT_CONFIG } from '../utils/config.js';
import { printTable } from '../utils/output.js';
import { render } from 'ink';
import React from 'react';
import { ConfigUI } from '../components/ConfigUI.js';
import { reestablishTTY } from '../utils/input.js';

export class ConfigCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'config',
    description: 'Manage jref configuration (local and global)',
    usage: 'jref config [action] [key] [value] [options]',
    options: [
      {
        flags: '--global, -g',
        description: 'Operate on global configuration (~/.jref/config.json)'
      },
      {
        flags: '--local, -l',
        description: 'Operate on local configuration (.jref/config.json) [default]'
      },
      {
        flags: '--ui, -u',
        description: 'Open interactive configuration dashboard'
      }
    ],
    examples: [
      'jref config list',
      'jref config get defaultOutput',
      'jref config set defaultOutput json --global',
      'jref config set ui.theme dark',
      'jref config reset defaultOutput',
      'jref config --ui'
    ],
    workflows: [
      'Configuration Hierarchy: Merges settings from Global (~/.jref/config.json) and Local (.jref/config.json) scopes.',
      'Scoped Operations: Use --global to set machine-wide preferences, or omit for project-specific overrides.',
      'Nested Keys: Access nested settings using dot notation (e.g., ui.theme).',
      'Interactive Dashboard: Use --ui to visually manage all configuration settings.',
      'Fallback Logic: If configuration is invalid, the CLI falls back to safe defaults and logs errors to .jref/debug.log.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, action, key, value } = this.parseArgs(args);

      if (options.ui || flags.ui) {
        return this.runUI(flags.global ? 'global' : 'local');
      }

      if (action === 'list' || !action) {
        return this.listConfig(options);
      }

      if (action === 'get') {
        if (!key) return this.error('Missing configuration key', options);
        return this.getConfig(key as string, options);
      }

      if (action === 'set') {
        if (!key) return this.error('Missing configuration key', options);
        if (value === undefined) return this.error('Missing configuration value', options);
        const scope = flags.global ? 'global' : 'local';
        return this.setConfig(key as string, value as string, scope, options);
      }

      if (action === 'reset') {
        if (!key) return this.error('Missing configuration key', options);
        const scope = flags.global ? 'global' : 'local';
        return this.resetConfig(key as string, scope, options);
      }

      return this.error(`Unknown config action: ${action}`, options);
    } catch (err) {
      return this.error(`Config failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    flags: Record<string, unknown>; 
    action?: string; 
    key?: string; 
    value?: string;
  } {
    const flags: Record<string, unknown> = {};
    let action: string | undefined;
    let key: string | undefined;
    let value: string | undefined;

    const positional: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--global' || arg === '-g') {
        flags.global = true;
      } else if (arg === '--local' || arg === '-l') {
        flags.local = true;
      } else if (arg === '--ui' || arg === '-u') {
        flags.ui = true;
      } else if (!arg.startsWith('-')) {
        positional.push(arg);
      }
    }

    action = positional[0];
    key = positional[1];
    value = positional[2];

    return { flags, action, key, value };
  }

  private async runUI(scope: 'global' | 'local'): Promise<CommandResult> {
    const config = loadConfig();
    
    // Re-establish TTY for Ink
    reestablishTTY();

    return new Promise((resolve) => {
      const { unmount } = render(
        React.createElement(ConfigUI, {
          config,
          onSave: (newConfig: JrefConfig) => {
            saveConfig(newConfig, scope);
          },
          onExit: () => {
            unmount();
            resolve(this.success());
          }
        })
      );
    });
  }

  private listConfig(options: CLIOptions): CommandResult {
    const config = loadConfig();
    if (options.json) {
      this.print(config, options);
    } else {
      console.log('\n⚙️ JREF CONFIGURATION');
      console.log('─'.repeat(40));
      const rows: string[][] = [];
      
      const flatten = (obj: any, prefix = '') => {
        for (const [k, v] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${k}` : k;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            flatten(v, path);
          } else {
            rows.push([path, String(v)]);
          }
        }
      };

      flatten(config);
      printTable(['Key', 'Value'], rows, options);
      console.log();
    }
    return this.success();
  }

  private getConfig(key: string, options: CLIOptions): CommandResult {
    const config = loadConfig();
    const val = this.getNestedValue(config, key);
    
    if (val === undefined) {
      return this.error(`Configuration key "${key}" not found`, options);
    }

    if (options.json) {
      this.print({ [key]: val }, options);
    } else {
      console.log(val);
    }
    return this.success();
  }

  private setConfig(key: string, value: string, scope: 'global' | 'local', options: CLIOptions): CommandResult {
    // Basic type conversion
    let typedValue: any = value;
    if (value === 'true') typedValue = true;
    else if (value === 'false') typedValue = false;
    else if (!isNaN(Number(value))) typedValue = Number(value);

    const update: any = {};
    const parts = key.split('.');
    let current = update;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = typedValue;

    try {
      saveConfig(update, scope);
      return this.success(`Successfully set ${key}=${value} in ${scope} config.`);
    } catch (err) {
      return this.error(`Failed to set config: ${(err as Error).message}`, options);
    }
  }

  private resetConfig(key: string, scope: 'global' | 'local', options: CLIOptions): CommandResult {
    const defaultVal = this.getNestedValue(DEFAULT_CONFIG, key);
    if (defaultVal === undefined) {
      return this.error(`Configuration key "${key}" has no default value`, options);
    }

    return this.setConfig(key, String(defaultVal), scope, options);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  }
}
