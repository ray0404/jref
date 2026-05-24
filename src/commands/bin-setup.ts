/**
 * Bin Setup Command
 * Creates a global jbin symlink for easy access to the bin command
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { symlinkSync, existsSync, readlinkSync, unlinkSync } from 'fs';
import { join } from 'path';
import { printSuccess, printWarning } from '../utils/output.js';

export class BinSetupCommand extends Command {
  readonly definition = {
    name: 'bin-setup',
    description: 'Setup global jbin symlink for executing embedded scripts',
    usage: 'jref bin-setup',
    options: [],
    examples: [
      'jref bin-setup'
    ],
    workflows: [
      'Symlink Generation: Creates a symlink in the system bin directory (e.g., /usr/local/bin or Termux bin) that points to jref, aliased as jbin.'
    ]
  };

  async execute(
    _args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const binDir = this.getSystemBinPath();
      const jrefPath = process.argv[1]; // Path to dist/cli.js
      const jbinPath = join(binDir, 'jbin');

      if (!jrefPath) {
        return this.error('Could not determine jref executable path', options);
      }

      // Check if jbin already exists
      if (existsSync(jbinPath)) {
        try {
          const existingTarget = readlinkSync(jbinPath);
          if (existingTarget === jrefPath) {
            printSuccess(`jbin already linked to ${jrefPath}`, options);
            return this.success();
          }
          printWarning(`jbin already exists and points to ${existingTarget}. Overwriting...`, options);
          unlinkSync(jbinPath);
        } catch (err) {
          printWarning(`jbin already exists but is not a symlink. Overwriting...`, options);
          unlinkSync(jbinPath);
        }
      }

      // Create symlink
      // On some systems this might require sudo/root
      try {
        symlinkSync(jrefPath, jbinPath);
        printSuccess(`Successfully created jbin symlink in ${binDir}`, options);
        console.log(`Now you can use 'jbin <snapshot> <script>' globally.`);
      } catch (err) {
        return this.error(`Failed to create symlink: ${(err as Error).message}. You might need to run with sudo.`, options);
      }

      return this.success();
    } catch (err) {
      return this.error(`Setup failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(_args: string[]): Record<string, unknown> {
    return {};
  }

  private getSystemBinPath(): string {
    // Check if we are in Termux
    if (process.env.TERMUX_VERSION || existsSync('/data/data/com.termux/files/usr/bin')) {
      return '/data/data/com.termux/files/usr/bin';
    }
    
    // Default for Linux/macOS
    return '/usr/local/bin';
  }
}
