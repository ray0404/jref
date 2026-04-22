/**
 * UI Command
 * Interactive Terminal User Interface for browsing project snapshots
 * Designed for mobile/Termux users who find typing long file paths tedious
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { loadSnapshot } from '../utils/streaming-json.js';
import { parseDirectoryStructure } from '../utils/ui.js';
import { reestablishTTY } from '../utils/input.js';
import { render } from 'ink';
import React from 'react';
import { SnapshotBrowser } from '../components/TUI.js';

interface UIFlags {
  help?: boolean;
}

export class UICommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'ui',
    description: 'Interactive TUI for browsing project snapshots (mobile-friendly)',
    usage: 'jref ui [file]',
    options: [
      {
        flags: '↑↓ / j,k',
        description: 'Navigate tree/file list'
      },
      {
        flags: '←→ / h,l',
        description: 'Expand/collapse directories'
      },
      {
        flags: 'Enter',
        description: 'Select file (view) or toggle directory'
      },
      {
        flags: '/',
        description: 'Search files by name'
      },
      {
        flags: 'y',
        description: 'Yank (copy) current file content to clipboard'
      },
      {
        flags: 'e',
        description: 'Edit current file in-memory using $EDITOR'
      },
      {
        flags: 'Esc',
        description: 'Back / Exit'
      }
    ],
    examples: [
      'jref ui snapshot.json',
      'cat snapshot.json | jref ui'
    ],
    workflows: [
      'Visual Exploration: Browse large codebases without extracting them.',
      'Mobile Development: Effortlessly navigate files on Termux using simple keybinds.',
      'Quick Edits: Use the "e" key to perform temporary edits in your preferred editor.',
      'Snippet Sharing: Use the "y" key to quickly copy code for use elsewhere.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args);

      if (flags.help) {
        this.printHelp(options);
        return this.success();
      }

      // Load snapshot from file or stdin
      const input: string | undefined = filePath ? await this.readFile(filePath) : context.stdin;
      const snapshot = await loadSnapshot(input);

      // Parse directory structure into tree
      const tree = parseDirectoryStructure(snapshot.directoryStructure || '');

      // Re-establish TTY if we were piped, so Ink can handle keyboard input
      if (context.stdinIsPipe) {
        reestablishTTY();
      }

      // Start TUI
      return new Promise((resolve) => {
        const { unmount } = render(
          React.createElement(SnapshotBrowser, {
            tree,
            files: snapshot.files,
            onExit: () => {
              unmount();
              resolve(this.success());
            }
          })
        );
      });
    } catch (err) {
      return this.error(`UI failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: UIFlags; filePath?: string } {
    const flags: UIFlags = {};
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--help':
        case '-h':
          flags.help = true;
          break;
        default:
          if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    return { flags, filePath };
  }

  private async readFile(filePath: string): Promise<string> {
    const { readFileSync } = await import('fs');
    return readFileSync(filePath, 'utf8');
  }
}