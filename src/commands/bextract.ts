/**
 * BExtract Command
 * Dedicated command for unpacking binary archives.
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { mkdir, writeFile, existsSync } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { decodeBase64 } from '../utils/binary.js';
import { getOptimalInputStream } from '../utils/input.js';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

interface BExtractFlags {
  outputDir?: string;
  overwrite?: boolean;
  dryRun?: boolean;
  stdout?: boolean;
  patterns?: string[];
}

export class BExtractCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'bextract',
    description: 'Unpack a JSON binary archive',
    usage: 'jref bextract [file] [options]',
    options: [
      {
        flags: '--output, -o <dir>',
        description: 'Target directory for extraction (default: ./extracted)'
      },
      {
        flags: '--overwrite, -w',
        description: 'Overwrite existing files'
      },
      {
        flags: '--dry-run',
        description: 'Show what would be extracted'
      },
      {
        flags: '--stdout',
        description: 'Pipes a single decoded asset directly to stdout'
      }
    ],
    examples: [
      'jref bextract archive.json',
      'jref bextract archive.json -o ./restore',
      'jref bextract archive.json --stdout "kick.wav" | ./dsp_tool'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args, context);
      const patterns = flags.patterns || [];

      // Handle --stdout piping
      if (flags.stdout) {
        if (patterns.length === 0) {
          return this.error('--stdout requires at least one file pattern', options);
        }
        
        options.silent = true;
        let pipedBuffer: Buffer | null = null;
        let pipedPath: string | null = null;
        const encodings: Record<string, string> = {};

        const onFilePipe = async (path: string, content: string) => {
          if (pipedBuffer) return;
          if (patterns.length > 0 && !patterns.some(p => path === p || path.endsWith('/' + p))) return;

          pipedPath = path;
          pipedBuffer = Buffer.from(content, 'utf8');
        };

        const input = getOptimalInputStream(filePath, context);

        await processSnapshot(input, {
          onMetadata: (key, value) => {
            if (key === 'encodings') Object.assign(encodings, value);
          },
          onFile: onFilePipe
        });

        if (pipedBuffer && pipedPath) {
          const encoding = encodings[pipedPath] || 'utf8';
          const content = (pipedBuffer as Buffer).toString('utf8');
          const finalBuffer = encoding === 'base64' ? decodeBase64(content) : Buffer.from(content, 'utf8');
          process.stdout.write(finalBuffer);
          return this.success();
        }

        return this.error('No binary files matched for piping', { ...options, silent: false });
      }

      const outputDir = flags.outputDir || './extracted';
      const encodings: Record<string, string> = {};
      const results: { path: string; size: number; success: boolean }[] = [];

      const input = getOptimalInputStream(filePath, context);

      await processSnapshot(input, {
        onMetadata: (key, value) => {
          if (key === 'encodings') {
            Object.assign(encodings, value);
          }
        },
        onFile: async (path, content) => {
          const encoding = encodings[path] || 'utf8';
          const outputPath = join(outputDir, path);
          
          const buffer = encoding === 'base64' ? decodeBase64(content) : Buffer.from(content, 'utf8');

          if (flags.dryRun) {
            results.push({ path, size: buffer.length, success: true });
            return;
          }

          if (!flags.overwrite && existsSync(outputPath)) {
            results.push({ path, size: 0, success: false });
            return;
          }

          const parentDir = dirname(outputPath);
          if (!existsSync(parentDir)) {
            await mkdirAsync(parentDir, { recursive: true });
          }

          await writeFileAsync(outputPath, buffer);
          results.push({ path, size: buffer.length, success: true });
        }
      });

      if (!options.silent) {
        const successCount = results.filter(r => r.success).length;
        console.error(`✅ Extracted ${successCount} files to ${outputDir}.`);
      }

      if (options.json) {
        return this.success(JSON.stringify(results, null, 2));
      }

      return this.success();
    } catch (err) {
      return this.error(`BExtract failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[], context?: CommandContext): { flags: BExtractFlags; filePath?: string } {
    const flags: BExtractFlags = {};
    let filePath: string | undefined;
    const patterns: string[] = [];
    const isPipe = context?.stdinIsPipe || false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--output' || arg === '-o') {
        flags.outputDir = args[++i];
      } else if (arg === '--overwrite' || arg === '-w') {
        flags.overwrite = true;
      } else if (arg === '--dry-run') {
        flags.dryRun = true;
      } else if (arg === '--stdout') {
        flags.stdout = true;
      } else if (!arg.startsWith('-')) {
        if (!filePath && !isPipe) {
          filePath = arg;
        } else {
          patterns.push(arg);
        }
      }
    }

    flags.patterns = patterns;
    return { flags, filePath };
  }
}
