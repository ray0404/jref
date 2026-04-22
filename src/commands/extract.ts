/**
 * Extract Command
 * Unpack specific files, directories, or entire project back into local filesystem
 * Supports streaming for large snapshots and wildcard pattern matching
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { mkdir, writeFile, existsSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';
import micromatch from 'micromatch';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

interface ExtractFlags {
  outputDir?: string;
  patterns?: string[];
  overwrite?: boolean;
  dryRun?: boolean;
  flat?: boolean;
}

export class ExtractCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'extract',
    description: 'Unpack files from snapshot to local filesystem',
    usage: 'jref extract [options] [file] [patterns...]',
    examples: [
      'jref extract snapshot.json',
      'jref extract snapshot.json "src/**/*.ts"',
      'jref extract --output ./output snapshot.json',
      'cat snapshot.json | jref extract "src/*.js"',
      'jref extract --dry-run snapshot.json'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args, context);

      // Determine output directory
      const outputDir = flags.outputDir as string || './extracted';
      const patterns = flags.patterns || [];
      const results: { path: string; size: number; success: boolean; skipped?: boolean }[] = [];

      // Use streaming processor to avoid OOM
      await processSnapshot(
        filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
        {
          onFile: async (path, content) => {
            // Check if path matches patterns (wildcard or directory prefix)
            const isMatch = patterns.length === 0 || 
                            micromatch.isMatch(path, patterns) ||
                            patterns.some(p => path.startsWith(p.endsWith('/') ? p : p + '/'));
            
            if (!isMatch) return;

            if (flags.dryRun) {
              results.push({ path, size: Buffer.byteLength(content, 'utf8'), success: true });
              return;
            }

            // Perform extraction
            const res = await this.extractFile(path, content, outputDir, flags.overwrite as boolean, flags.flat as boolean);
            results.push(res);
          }
        }
      );

      if (results.length === 0) {
        return this.error('No files matched the patterns or snapshot is empty', options);
      }

      // Output results
      if (flags.dryRun) {
        this.outputDryRun(results, outputDir, flags.flat as boolean, options);
      } else {
        this.outputResults(results, options);
      }

      return this.success();
    } catch (err) {
      return this.error(`Extract failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[], context?: CommandContext): { flags: ExtractFlags; filePath?: string } {
    const flags: ExtractFlags = {};
    let filePath: string | undefined;
    const patterns: string[] = [];

    const isPipe = context?.stdinIsPipe || false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--output':
        case '-o':
          flags.outputDir = args[++i];
          break;
        case '--overwrite':
        case '-w':
          flags.overwrite = true;
          break;
        case '--dry-run':
          flags.dryRun = true;
          break;
        case '--flat':
          flags.flat = true;
          break;
        case '--paths':
        case '-p':
          // Support old --paths flag for backward compatibility
          while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
              patterns.push(args[++i]);
          }
          break;
        default:
          if (!arg.startsWith('-')) {
            if (!filePath && !isPipe) {
              filePath = arg;
            } else {
              patterns.push(arg);
            }
          }
      }
    }

    flags.patterns = patterns;
    return { flags, filePath };
  }

  private async extractFile(
    filePath: string,
    content: string,
    outputDir: string,
    overwrite: boolean,
    flat: boolean | undefined
  ): Promise<{ path: string; size: number; success: boolean; skipped?: boolean }> {
    let outputPath: string;
    if (flat) {
      outputPath = join(outputDir, filePath.split('/').pop()!);
    } else {
      outputPath = join(outputDir, filePath);
    }

    try {
      // Check if file exists (unless overwrite)
      if (!overwrite && existsSync(outputPath)) {
        return { path: outputPath, size: 0, success: false, skipped: true };
      }

      // Create parent directories
      const parentDir = dirname(outputPath);
      if (!existsSync(parentDir)) {
        await mkdirAsync(parentDir, { recursive: true });
      }

      // Write file
      await writeFileAsync(outputPath, content, 'utf8');

      return {
        path: outputPath,
        size: Buffer.byteLength(content, 'utf8'),
        success: true
      };
    } catch (err) {
      return { path: outputPath, size: 0, success: false };
    }
  }

  private outputDryRun(
    results: { path: string; size: number }[],
    outputDir: string,
    flat: boolean | undefined,
    options: CLIOptions
  ): void {
    if (options.json) {
      this.print({ files: results.map(r => r.path), outputDir, flat, action: 'dry-run' }, options);
      return;
    }

    console.log('\n🔍 DRY RUN - Files that would be extracted:\n');
    for (const r of results) {
      console.log(`  ${r.path} (${this.formatBytes(r.size)})`);
    }
    console.log(`\nTotal: ${results.length} file(s)`);
    console.log(`Output directory: ${outputDir}`);
    console.log();
  }

  private outputResults(
    results: { path: string; size: number; success: boolean; skipped?: boolean }[],
    options: CLIOptions
  ): void {
    const successful = results.filter((r) => r.success);
    const skipped = results.filter((r) => r.skipped);
    const failed = results.filter((r) => !r.success && !r.skipped);

    if (options.json) {
      this.print({
        total: results.length,
        successful: successful.length,
        skipped: skipped.length,
        failed: failed.length,
        files: results
      }, options);
      return;
    }

    console.log('\n📦 EXTRACTION RESULTS\n');

    if (successful.length > 0) {
      console.log(`✅ Successfully extracted ${successful.length} file(s):`);
      // Show first 10 files if too many
      const showCount = Math.min(successful.length, 20);
      for (let i = 0; i < showCount; i++) {
        console.log(`   ${successful[i].path} (${this.formatBytes(successful[i].size)})`);
      }
      if (successful.length > showCount) {
        console.log(`   ... and ${successful.length - showCount} more`);
      }
    }

    if (skipped.length > 0) {
      console.log(`\n⏭️  Skipped ${skipped.length} existing file(s) (use --overwrite to replace)`);
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
