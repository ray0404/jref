/**
 * Reconstruct Command
 * Dry-run/check mode to verify if a local directory matches the snapshot
 * Compares local files against the snapshot contents
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ReconstructResult } from '../types/index.js';
import { loadSnapshot } from '../utils/streaming-json.js';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

interface ReconstructFlags {
  directory?: string;
  verbose?: boolean;
  ignoreMissing?: boolean;
  ignoreExtra?: boolean;
}

export class ReconstructCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'reconstruct',
    description: 'Verify if a local directory matches the snapshot (dry-run mode)',
    usage: 'jref reconstruct [options] [file]',
    examples: [
      'jref reconstruct snapshot.json',
      'jref reconstruct --directory ./my-project snapshot.json',
      'jref reconstruct --verbose snapshot.json',
      'cat snapshot.json | jref reconstruct --directory ./src',
      'jref reconstruct --json snapshot.json'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args);

      // Load snapshot
      const snapshot = await loadSnapshot(
        filePath ? await this.readFile(filePath) : context.stdin
      );

      // Determine directory to check
      const directory = flags.directory as string || '.';

// Verify directory exists
    if (!this.directoryExists(directory)) {
        return this.error(`Directory does not exist: ${directory}`, options);
      }

      // Perform comparison
      const result = await this.compareWithSnapshot(snapshot, directory, flags);

      // Output results
      const exitCode = this.outputResults(result, options, flags);

      return {
        success: result.matches,
        exitCode: exitCode as 0 | 1,
        output: options.json ? JSON.stringify(result) : undefined
      };
    } catch (err) {
      return this.error(`Reconstruct failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: ReconstructFlags; filePath?: string } {
    const flags: ReconstructFlags = {};
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--directory':
        case '-d':
          flags.directory = args[++i];
          break;
        case '--verbose':
        case '-v':
          flags.verbose = true;
          break;
        case '--ignore-missing':
          flags.ignoreMissing = true;
          break;
        case '--ignore-extra':
          flags.ignoreExtra = true;
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

  private directoryExists(path: string): boolean {
    try {
      return statSync(path).isDirectory();
    } catch {
      return false;
    }
  }

  private async compareWithSnapshot(
    snapshot: { files: Record<string, string> },
    directory: string,
    _flags: ReconstructFlags
  ): Promise<ReconstructResult> {
    const snapshotFiles = new Set(Object.keys(snapshot.files));
    const localFiles = new Set<string>();
    const missingFiles: string[] = [];
    const extraFiles: string[] = [];
    const modifiedFiles: string[] = [];

    // Get all local files recursively
    this.collectLocalFiles(directory, directory, localFiles);

    // Check for missing files (in snapshot but not local)
    for (const snapshotFile of snapshotFiles) {
      if (!localFiles.has(snapshotFile)) {
        missingFiles.push(snapshotFile);
      }
    }

    // Check for extra files (local but not in snapshot)
    for (const localFile of localFiles) {
      if (!snapshotFiles.has(localFile)) {
        extraFiles.push(localFile);
      }
    }

    // Check for modified files (content differs)
    for (const file of snapshotFiles) {
      if (localFiles.has(file)) {
        const localPath = join(directory, file);
        try {
          const localContent = readFileSync(localPath, 'utf8');
          if (localContent !== snapshot.files[file]) {
            modifiedFiles.push(file);
          }
        } catch {
          // File exists but couldn't be read - skip
        }
      }
    }

    const matches =
      missingFiles.length === 0 &&
      extraFiles.length === 0 &&
      modifiedFiles.length === 0;

    return {
      matches,
      missingFiles,
      extraFiles,
      modifiedFiles,
      totalChecked: snapshotFiles.size
    };
  }

  private collectLocalFiles(
    baseDir: string,
    currentDir: string,
    fileSet: Set<string>
  ): void {
    try {
      const entries = readdirSync(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const relativePath = relative(baseDir, fullPath);

        // Skip common ignore patterns
        if (this.shouldIgnore(relativePath)) {
          continue;
        }

        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            this.collectLocalFiles(baseDir, fullPath, fileSet);
          } else if (stat.isFile()) {
            fileSet.add(relativePath.replace(/\\/g, '/'));
          }
        } catch {
          // Skip files we can't stat
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  private shouldIgnore(path: string): boolean {
    const ignorePatterns = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      '__pycache__',
      '.DS_Store',
      'Thumbs.db',
      '.env',
      '.env.local',
      'dist',
      'build',
      '.cache'
    ];

    const normalizedPath = path.replace(/\\/g, '/');
    return ignorePatterns.some((pattern) =>
      normalizedPath.includes(pattern)
    );
  }

  private outputResults(
    result: ReconstructResult,
    options: CLIOptions,
    flags: ReconstructFlags
  ): number {
    if (options.json) {
      this.print(result, options);
      return result.matches ? 0 : 1;
    }

    console.log('\n🔍 RECONSTRUCT CHECK RESULTS\n');

    if (result.matches) {
      console.log('✅ Directory matches snapshot perfectly!');
    } else {
      console.log('❌ Directory does NOT match snapshot\n');
    }

    // Show summary
    console.log(`Files checked: ${result.totalChecked}`);
    console.log(`Missing files: ${result.missingFiles.length}`);
    console.log(`Extra files: ${result.extraFiles.length}`);
    console.log(`Modified files: ${result.modifiedFiles.length}`);
    console.log();

    // Verbose output
    if (flags.verbose) {
      if (result.missingFiles.length > 0) {
        console.log('📄 MISSING FILES (in snapshot but not local):');
        for (const f of result.missingFiles) {
          console.log(`   - ${f}`);
        }
        console.log();
      }

      if (result.extraFiles.length > 0) {
        console.log('📄 EXTRA FILES (local but not in snapshot):');
        for (const f of result.extraFiles) {
          console.log(`   + ${f}`);
        }
        console.log();
      }

      if (result.modifiedFiles.length > 0) {
        console.log('📄 MODIFIED FILES (content differs):');
        for (const f of result.modifiedFiles) {
          console.log(`   ~ ${f}`);
        }
        console.log();
      }
    }

    return result.matches ? 0 : 1;
  }
}