/**
 * BExtract Command
 * Dedicated command for unpacking binary archives.
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { mkdir, writeFile, existsSync, createReadStream, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';
import { decodeBase64 } from '../utils/binary.js';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

interface BExtractFlags {
  outputDir?: string;
  overwrite?: boolean;
  dryRun?: boolean;
}

export class BExtractCommand extends Command {
  // ...
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
      }
    ],
    examples: [
      'jref bextract archive.json',
      'jref bextract archive.json -o ./restore'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args, context);
      const outputDir = flags.outputDir || './extracted';
      const encodings: Record<string, string> = {};
      const results: { path: string; size: number; success: boolean }[] = [];

      // Determine if we should read fully or stream
      let input: string | NodeJS.ReadableStream;
      if (filePath) {
        const stats = statSync(filePath);
        if (stats.size < 8 * 1024 * 1024) { // 8MB
          input = readFileSync(filePath, 'utf8');
        } else {
          input = createReadStream(filePath);
        }
      } else {
        input = context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin;
      }

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
    const isPipe = context?.stdinIsPipe || false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--output' || arg === '-o') {
        flags.outputDir = args[++i];
      } else if (arg === '--overwrite' || arg === '-w') {
        flags.overwrite = true;
      } else if (arg === '--dry-run') {
        flags.dryRun = true;
      } else if (!arg.startsWith('-')) {
        if (!filePath && !isPipe) {
          filePath = arg;
        }
      }
    }

    return { flags, filePath };
  }
}
