
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { existsSync, readFileSync, readdirSync, lstatSync } from 'fs';
import { join, relative } from 'path';
import { printTable } from '../utils/output.js';

export class DiffCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'diff',
    description: 'Compare snapshot against local filesystem',
    usage: 'jref diff [options] [file.json]',
    examples: [
      'jref diff snapshot.json',
      'jref diff --directory ./another-project snapshot.json'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, snapshotFile } = this.parseArgs(args);
      const targetDir = (flags.directory as string) || process.cwd();

      let snapshot: ProjectSnapshot;
      if (context.snapshot) {
        snapshot = context.snapshot;
      } else if (snapshotFile) {
        const { loadSnapshotFromFile } = await import('../utils/streaming-json.js');
        snapshot = await loadSnapshotFromFile(snapshotFile);
      } else {
        const { loadSnapshot } = await import('../utils/streaming-json.js');
        snapshot = await loadSnapshot(context.stdin);
      }

      const modifiedFiles: string[] = [];
      const missingFiles: string[] = [];
      const extraFiles: string[] = [];

      // 1. Check files from snapshot
      for (const [filePath, content] of Object.entries(snapshot.files)) {
        const localPath = join(targetDir, filePath);
        
        if (!existsSync(localPath)) {
          missingFiles.push(filePath);
        } else if (lstatSync(localPath).isDirectory()) {
          // Path in snapshot is a file, but on disk is a directory (unlikely but possible)
          missingFiles.push(filePath);
        } else {
          const localContent = readFileSync(localPath, 'utf8');
          if (localContent !== content) {
            modifiedFiles.push(filePath);
          }
        }
      }

      // 2. Check for extra local files (optional, we could walker here)
      // This is more expensive, so we might make it an optional flag --all
      if (flags.all) {
          this.findExtraFiles(targetDir, snapshot.files, extraFiles);
      }

      const result = {
        modifiedFiles,
        missingFiles,
        extraFiles,
        targetDir
      };

      if (options.json) {
        const output = JSON.stringify(result, null, 2);
        this.print(result, options);
        return this.success(output);
      } else {
        this.printHumanDiff(result, options);
        return this.success();
      }

    } catch (err) {
      return this.error(`Diff failed: ${(err as Error).message}`, options);
    }
  }

  private findExtraFiles(dir: string, snapshotFiles: Record<string, string>, extraFiles: string[], baseDir?: string): void {
    const root = baseDir || dir;
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = relative(root, fullPath);
      
      // Basic ignore list (should use .gitignore later)
      if (entry === '.git' || entry === 'node_modules' || entry === 'dist') continue;

      if (lstatSync(fullPath).isDirectory()) {
        this.findExtraFiles(fullPath, snapshotFiles, extraFiles, root);
      } else if (snapshotFiles[relativePath] === undefined) {
        extraFiles.push(relativePath);
      }
    }
  }

  private printHumanDiff(result: any, options: CLIOptions): void {
    console.log(`\n🔍 DIFFING SNAPSHOT VS ${result.targetDir}`);
    console.log('─'.repeat(50));

    const tableData: string[][] = [];

    for (const f of result.modifiedFiles) tableData.push(['M', f]);
    for (const f of result.missingFiles) tableData.push(['A', f + ' (missing locally)']);
    for (const f of result.extraFiles) tableData.push(['D', f + ' (not in snapshot)']);

    if (tableData.length === 0) {
      console.log('✅ No differences found');
    } else {
      printTable(['Status', 'Path'], tableData, options);
    }
    console.log();
  }

  protected parseArgs(args: string[]): { flags: Record<string, unknown>; snapshotFile?: string } {
    const flags: Record<string, unknown> = {};
    let snapshotFile: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--directory' || arg === '-d') {
        flags.directory = args[++i];
      } else if (arg === '--all' || arg === '-a') {
        flags.all = true;
      } else if (!arg.startsWith('-')) {
        snapshotFile = arg;
      }
    }

    return { flags, snapshotFile };
  }
}
