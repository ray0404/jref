/**
 * Extract Command
 * Unpack specific files, directories, or entire project back into local filesystem
 * Preserves paths and handles Termux path resolution correctly
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { loadSnapshot } from '../utils/streaming-json.js';
import { mkdir, writeFile, existsSync } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

interface ExtractFlags {
  outputDir?: string;
  paths?: string[];
  overwrite?: boolean;
  dryRun?: boolean;
  flat?: boolean;
}

export class ExtractCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'extract',
    description: 'Unpack files, directories, or entire project to local filesystem',
    usage: 'jref extract [options] [file]',
    examples: [
      'jref extract snapshot.json',
      'jref extract --output ./output snapshot.json',
      'jref extract --paths src/main.ts src/utils.ts snapshot.json',
      'jref extract --dry-run snapshot.json',
      'cat snapshot.json | jref extract --output ./output'
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

      // Determine output directory
      const outputDir = flags.outputDir as string || './extracted';

      // Determine which files to extract
      let filesToExtract: string[];
      if (flags.paths && (flags.paths as string[]).length > 0) {
        filesToExtract = (flags.paths as string[]).filter((p) =>
          snapshot.files[p] !== undefined
        );
        if (filesToExtract.length !== (flags.paths as string[]).length) {
          const missing = (flags.paths as string[]).filter(
            (p) => snapshot.files[p] === undefined
          );
          return this.error(
            `Some paths not found in snapshot: ${missing.join(', ')}`,
            options
          );
        }
      } else {
        filesToExtract = Object.keys(snapshot.files);
      }

      if (filesToExtract.length === 0) {
        return this.error('No files to extract', options);
      }

      // Dry run mode
      if (flags.dryRun) {
        return this.dryRun(filesToExtract, outputDir, flags.flat as boolean, options);
      }

      // Perform extraction
      const extracted = await this.extractFiles(
        snapshot.files,
        filesToExtract,
        outputDir,
        flags.overwrite as boolean,
        flags.flat as boolean
      );

      // Output results
      this.outputResults(extracted, options);

      return this.success();
    } catch (err) {
      return this.error(`Extract failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: ExtractFlags; filePath?: string } {
    const flags: ExtractFlags = {};
    let filePath: string | undefined;
    let paths: string[] = [];
    let collectingPaths = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--output':
        case '-o':
          flags.outputDir = args[++i];
          break;
        case '--paths':
        case '-p':
          collectingPaths = true;
          break;
        case '--overwrite':
        case '-w':
          flags.overwrite = true;
          break;
        case '--dry-run':
        case '-n':
          flags.dryRun = true;
          break;
        case '--flat':
          flags.flat = true;
          break;
        default:
          if (collectingPaths && !arg.startsWith('-')) {
            paths.push(arg);
          } else if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    if (paths.length > 0) {
      flags.paths = paths;
    }

    return { flags, filePath };
  }

  private async readFile(filePath: string): Promise<string> {
    const { readFileSync } = await import('fs');
    return readFileSync(filePath, 'utf8');
  }

  private dryRun(
    files: string[],
    outputDir: string,
    flat: boolean | undefined,
    options: CLIOptions
  ): CommandResult {
    if (options.json) {
      this.print({ files, outputDir, flat, action: 'dry-run' }, options);
      return this.success();
    }

    console.log('\n🔍 DRY RUN - Files to extract:\n');
    for (const file of files) {
      const outputPath = flat ? join(outputDir, file.split('/').pop()!) : join(outputDir, file);
      console.log(`  ${file} → ${outputPath}`);
    }
    console.log(`\nTotal: ${files.length} file(s)`);
    console.log(`Output directory: ${outputDir}`);
    console.log();

    return this.success();
  }

  private async extractFiles(
    allFiles: Record<string, string>,
    filesToExtract: string[],
    outputDir: string,
    overwrite: boolean,
    flat: boolean | undefined
  ): Promise<{ path: string; size: number; success: boolean }[]> {
    const results: { path: string; size: number; success: boolean }[] = [];

    for (const filePath of filesToExtract) {
      const content = allFiles[filePath];
      if (content === undefined) continue;

      let outputPath: string;
      if (flat) {
        outputPath = join(outputDir, filePath.split('/').pop()!);
      } else {
        outputPath = join(outputDir, filePath);
      }

      try {
        // Check if file exists (unless overwrite)
        if (!overwrite && existsSync(outputPath)) {
          results.push({ path: outputPath, size: 0, success: false });
          continue;
        }

        // Create parent directories
        const parentDir = dirname(outputPath);
        if (!existsSync(parentDir)) {
          await mkdirAsync(parentDir, { recursive: true });
        }

        // Write file
        await writeFileAsync(outputPath, content, 'utf8');

        results.push({
          path: outputPath,
          size: Buffer.byteLength(content, 'utf8'),
          success: true
        });
      } catch (err) {
        results.push({ path: outputPath, size: 0, success: false });
      }
    }

    return results;
  }

  private outputResults(
    results: { path: string; size: number; success: boolean }[],
    options: CLIOptions
  ): void {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (options.json) {
      this.print({
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        files: results
      }, options);
      return;
    }

    console.log('\n📦 EXTRACTION RESULTS\n');

    if (successful.length > 0) {
      console.log(`✅ Successfully extracted ${successful.length} file(s):`);
      for (const r of successful) {
        console.log(`   ${r.path} (${this.formatBytes(r.size)})`);
      }
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed to extract ${failed.length} file(s):`);
      for (const r of failed) {
        console.log(`   ${r.path}`);
      }
    }

    console.log();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}