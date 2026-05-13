import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { createVirtualFs, exportVirtualFs, getGitOptions } from '../utils/git.js';
import * as git from 'isomorphic-git';
import { generateDirectoryStructure } from '../utils/streaming-json.js';
import { reestablishTTY } from '../utils/input.js';
import { render } from 'ink';
import React from 'react';
import { GitUI } from '../components/GitUI.js';
import { spawnSync } from 'child_process';
import * as fs from 'fs';

interface GitFlags {
  help?: boolean;
  message?: string;
  author?: string;
  email?: string;
  local?: boolean;
}

export class GitCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'git',
    description: 'Virtualized or local Git operations',
    usage: 'jref git <subcommand> [args] [file]',
    options: [
      {
        flags: 'ui',
        description: 'Launch interactive Git TUI'
      },
      {
        flags: '-l, --local',
        description: 'Force operation on local repository (ignore snapshot)'
      },
      {
        flags: '-m, --message <text>',
        description: 'Commit message'
      },
      {
        flags: '--author <name>',
        description: 'Commit author name'
      },
      {
        flags: '--email <email>',
        description: 'Commit author email'
      }
    ],
    examples: [
      'jref git status',
      'jref git log -l',
      'jref git ui snapshot.json',
      'jref git add file.txt snapshot.json',
      'cat snapshot.json | jref git status'
    ],
    workflows: [
      'Local Repo: Absence of [file] or use of -l/--local operates on the current directory.',
      'Virtual Versioning: Use snapshots to track changes without a local .git directory.',
      'Interactive Git: Launch the "ui" for a visual staging and commit experience.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { subcommand, gitArgs, filePath, flags } = this.parseArgs(args);

      if (flags.help) {
        this.printHelp(options);
        return this.success();
      }

      // Detect if we should use local repo or snapshot
      // Local mode if:
      // 1. --local flag is present
      // 2. filePath is '-' (explicit local mode signal in some tools)
      // 3. No filePath, no snapshot in context, and (no stdin pipe OR empty stdin)
      const hasStdinData = context.stdin && context.stdin.trim().length > 0;
      const isLocalMode = flags.local || filePath === '-' || (!filePath && !context.snapshot && (!context.stdinIsPipe || !hasStdinData));

      if (isLocalMode) {
        if (!subcommand) {
          this.printHelp(options);
          return this.success();
        }

        if (subcommand === 'ui') {
          if (context.stdinIsPipe) reestablishTTY();
          return new Promise((resolve) => {
            const { unmount } = render(
              React.createElement(GitUI, {
                vol: fs,
                files: this.getLocalFiles(),
                onExit: () => {
                  unmount();
                  resolve(this.success());
                }
              })
            );
          });
        }

        // For local mode subcommands, we shell out to real git for maximum compatibility
        const realGitArgs = subcommand ? [subcommand, ...gitArgs] : gitArgs;
        
        // Forward flags if relevant
        if (flags.message) {
            realGitArgs.push('-m', flags.message);
        }

        const gitProc = spawnSync('git', realGitArgs, { stdio: 'inherit' });
        if (gitProc.status !== 0) {
            return {
                success: false,
                exitCode: (gitProc.status as any) || 1,
                error: `Local git command failed with status ${gitProc.status}`
            };
        }
        return this.success();
      }

      // Virtual Snapshot Mode
      if (!subcommand && !filePath) {
        this.printHelp(options);
        return this.success();
      }

      // Load snapshot
      const snapshot = await this.getSnapshot(context, options, filePath);
      const vol = createVirtualFs(snapshot);
      const gitOpts = getGitOptions(vol);

      // Track which paths were originally absolute
      const originalAbsolutePaths = new Set<string>();
      for (const path of Object.keys(snapshot.files)) {
        if (path.startsWith('/')) {
          originalAbsolutePaths.add(path);
        }
      }

      let mutation = false;
      let resultData: any;

      // Ensure .git exists or handle init
      const gitDirExists = vol.existsSync('/.git');
      if (!gitDirExists && subcommand !== 'init' && subcommand !== 'ui') {
        if (!options.silent) console.error('⚠️  No .git directory found in snapshot. Initializing virtual repo...');
        await git.init(gitOpts);
        mutation = true;
      }

      if (subcommand === 'ui') {
        if (context.stdinIsPipe) {
          reestablishTTY();
        }

        return new Promise((resolve) => {
          const { unmount } = render(
            React.createElement(GitUI, {
              vol,
              files: snapshot.files,
              onExit: (hasMutation: boolean) => {
                unmount();
                if (hasMutation) {
                  const { files: updatedFiles, encodings: updatedEncodings } = exportVirtualFs(vol, originalAbsolutePaths);
                  const updatedSnapshot: ProjectSnapshot = {
                    ...snapshot,
                    files: updatedFiles,
                    encodings: updatedEncodings,
                    directoryStructure: generateDirectoryStructure(Object.keys(updatedFiles))
                  };
                  resolve(this.success(JSON.stringify(updatedSnapshot, null, 2)));
                } else {
                  resolve(this.success());
                }
              }
            })
          );
        });
      }

      switch (subcommand) {
        case 'init':
          await git.init(gitOpts);
          mutation = true;
          resultData = { message: 'Initialized empty virtual Git repository' };
          break;

        case 'status':
          const filePaths = Object.keys(snapshot.files);
          const statusPromises = filePaths.map(async (filepath) => {
            const status = await git.status({ ...gitOpts, filepath });
            return { filepath, status };
          });
          const statuses = await Promise.all(statusPromises);
          const statusResult = statuses.filter(s => s.status !== 'unmodified');
          resultData = statusResult;
          break;

        case 'log':
          resultData = await git.log(gitOpts);
          break;

        case 'add':
          if (gitArgs.length === 0) return this.error('No files specified to add', options);
          for (const filepath of gitArgs) {
            await git.add({ ...gitOpts, filepath });
          }
          mutation = true;
          resultData = { message: `Added ${gitArgs.length} files to index` };
          break;

        case 'commit':
          const sha = await git.commit({
            ...gitOpts,
            message: flags.message || 'Updated via jref git',
            author: {
              name: flags.author || 'Jref User',
              email: flags.email || 'user@jref.io'
            }
          });
          mutation = true;
          resultData = { message: 'Committed successfully', sha };
          break;

        case 'branch':
          if (gitArgs.length > 0) {
            await git.branch({ ...gitOpts, ref: gitArgs[0] });
            mutation = true;
            resultData = { message: `Created branch ${gitArgs[0]}` };
          } else {
            resultData = await git.listBranches(gitOpts);
          }
          break;

        case 'checkout':
          if (gitArgs.length === 0) return this.error('No branch/commit specified to checkout', options);
          await git.checkout({ ...gitOpts, ref: gitArgs[0] });
          mutation = true;
          resultData = { message: `Switched to ${gitArgs[0]}` };
          break;

        case 'stash':
          // We support pushing to stash
          // git stash -> isomorphic-git stash doesn't perfectly mirror CLI but there's a stash command.
          // isomorphic-git's stash function takes optional ref, author, message. But the API might vary.
          // It's mostly a wrapper around commit with no parent branch update.
          // Let's implement a simple stash
          // Actually, git.stash exists? Let's check docs, but we'll try to just call git.stash(gitOpts)
          // The CLI signature: git.stash({ fs, dir })
          console.log("Stashing...");
          try {
             // Let's ensure author is provided, isomorphic-git might require it
             const stashOpts = {
               ...gitOpts,
               author: { name: 'Jref User', email: 'user@jref.io' }
             };
             if (gitArgs[0] === 'pop' || gitArgs[0] === 'apply') {
               // We probably don't have pop/apply natively exposed easily, so let's just use what we can or warn.
               // wait, isomorphic-git has a stash, but let's just do a generic catch if it fails.
               return this.error('Stash pop/apply might not be fully supported by isomorphic-git.', options);
             } else {
               const stashOid = await (git as any).stash(stashOpts);
               mutation = true;
               resultData = { message: `Stashed changes: ${stashOid}` };
             }
          } catch(e) {
             return this.error(`Stash failed: ${(e as Error).message}`, options);
          }
          break;

        case 'cherry-pick':
          if (gitArgs.length === 0) return this.error('No commit specified to cherry-pick', options);
          try {
            await (git as any).cherryPick({
              ...gitOpts,
              oid: gitArgs[0],
              author: { name: 'Jref User', email: 'user@jref.io' }
            });
            mutation = true;
            resultData = { message: `Cherry-picked ${gitArgs[0]}` };
          } catch(e) {
            return this.error(`Cherry-pick failed: ${(e as Error).message}`, options);
          }
          break;

        case 'rebase':
          return this.error('Rebase is not natively supported by isomorphic-git.', options);

        default:
          return this.error(`Unknown subcommand: ${subcommand}`, options);
      }

      if (mutation) {
        const { files: updatedFiles, encodings: updatedEncodings } = exportVirtualFs(vol, originalAbsolutePaths);
        const updatedSnapshot: ProjectSnapshot = {
          ...snapshot,
          files: updatedFiles,
          encodings: updatedEncodings,
          directoryStructure: generateDirectoryStructure(Object.keys(updatedFiles))
        };
        
        if (options.json || options.silent) {
          return this.success(JSON.stringify(updatedSnapshot, null, 2));
        }
        
        // If not JSON output, we print the command result and then the updated snapshot
        this.print(resultData, options);
        process.stdout.write('\n--- UPDATED SNAPSHOT ---\n');
        process.stdout.write(JSON.stringify(updatedSnapshot, null, 2) + '\n');
        return this.success();
      }

      this.print(resultData, options);
      return this.success();

    } catch (err) {
      return this.error(`Git command failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { 
    subcommand?: string; 
    gitArgs: string[]; 
    filePath?: string; 
    flags: GitFlags 
  } {
    const flags: GitFlags = {};
    let subcommand: string | undefined;
    const gitArgs: string[] = [];
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--help' || arg === '-h') {
        flags.help = true;
      } else if (arg === '-l' || arg === '--local') {
        flags.local = true;
      } else if (arg === '-m' || arg === '--message') {
        flags.message = args[++i];
      } else if (arg === '--author') {
        flags.author = args[++i];
      } else if (arg === '--email') {
        flags.email = args[++i];
      } else if (!subcommand && !arg.startsWith('-')) {
        subcommand = arg;
      } else if (!subcommand && arg === '-') {
          // Explicit local mode signal
          filePath = '-';
      } else {
          // It's a git argument or a flag for git
          gitArgs.push(arg);
      }
    }

    // Heuristic to separate gitArgs from filePath
    if (gitArgs.length > 0 && !flags.local) {
      const lastArg = gitArgs[gitArgs.length - 1];
      if (lastArg.endsWith('.json') || lastArg.endsWith('.yaml') || lastArg.endsWith('.yml')) {
        filePath = gitArgs.pop();
      }
    }

    return { subcommand, gitArgs, filePath, flags };
  }

  private getLocalFiles(): Record<string, string> {
      // For local UI, we need a list of files to check status
      const proc = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '--cached'], { encoding: 'utf8' });
      const files: Record<string, string> = {};
      if (proc.status === 0) {
          const paths = proc.stdout.split('\n').filter(Boolean);
          for (const p of paths) {
              files[p] = ''; // Content not needed for status listing in GitUI
          }
      }
      return files;
  }
}
