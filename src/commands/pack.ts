
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { readFileSync, readdirSync, lstatSync, existsSync } from 'fs';
import { join, relative, basename } from 'path';
import ignore from 'ignore';

export class PackCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'pack',
    description: 'Create a snapshot from a local directory',
    usage: 'jref pack [directory] [options]',
    examples: [
      'jref pack . > snapshot.json',
      'jref pack ./my-project --instruction "Follow these rules" > snapshot.json'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, targetDir } = this.parseArgs(args);
      const rootDir = targetDir || process.cwd();

      if (!existsSync(rootDir)) {
        return this.error(`Directory not found: ${rootDir}`, options);
      }

      const files: Record<string, string> = {};
      const ig = ignore();

      // Load .gitignore if it exists
      const gitignorePath = join(rootDir, '.gitignore');
      if (existsSync(gitignorePath)) {
        ig.add(readFileSync(gitignorePath, 'utf8'));
      }
      
      // Always ignore .git
      ig.add('.git');

      const treeLines: string[] = [basename(rootDir) + '/'];
      this.walk(rootDir, rootDir, ig, files, treeLines, '');

      const snapshot: ProjectSnapshot = {
        directoryStructure: treeLines.join('\n'),
        files,
        instruction: (flags.instruction as string) || undefined,
        fileSummary: (flags.summary as string) || undefined
      };

      const output = JSON.stringify(snapshot, null, 2);
      
      // If --json flag is set or silent, we don't print decoration
      if (options.json || options.silent) {
        return this.success(output);
      }

      console.log(output);
      return this.success(output);

    } catch (err) {
      return this.error(`Pack failed: ${(err as Error).message}`, options);
    }
  }

  private walk(
    currentDir: string,
    rootDir: string,
    ig: any,
    files: Record<string, string>,
    treeLines: string[],
    prefix: string
  ): void {
    const entries = readdirSync(currentDir).sort();
    
    entries.forEach((entry, index) => {
      const fullPath = join(currentDir, entry);
      const relPath = relative(rootDir, fullPath);

      if (ig.ignores(relPath)) return;

      const isLast = index === entries.length - 1;
      const stats = lstatSync(fullPath);
      const isDir = stats.isDirectory();

      // Add to tree
      treeLines.push(`${prefix}${isLast ? '└── ' : '├── '}${entry}${isDir ? '/' : ''}`);

      if (isDir) {
        this.walk(fullPath, rootDir, ig, files, treeLines, prefix + (isLast ? '    ' : '│   '));
      } else {
        files[relPath] = readFileSync(fullPath, 'utf8');
      }
    });
  }

  protected parseArgs(args: string[]): { flags: Record<string, unknown>; targetDir?: string } {
    const flags: Record<string, unknown> = {};
    let targetDir: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--instruction') {
        flags.instruction = args[++i];
      } else if (arg === '--summary') {
        flags.summary = args[++i];
      } else if (!arg.startsWith('-')) {
        targetDir = arg;
      }
    }

    return { flags, targetDir };
  }
}
