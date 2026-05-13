/**
 * BPack Command
 * Dedicated command for purely archiving raw/binary files without repomix overhead.
 * Mirrors tar but outputs JSON.
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, relative, join } from 'path';
import { generateDirectoryStructure } from '../utils/streaming-json.js';
import { getFileEncoding, encodeBase64 } from '../utils/binary.js';
import ignore from 'ignore';
import { writeFile } from 'fs/promises';

interface BPackFlags {
  output?: string;
  exclude?: string[];
  maxBinarySize?: number;
}

export class BPackCommand extends Command {
  readonly definition = {
    name: 'bpack',
    description: 'Archive a directory into a JSON snapshot (supports binary)',
    usage: 'jref bpack [directory] [options]',
    options: [
      {
        flags: '--output, -o <file>',
        description: 'Output filename (default: stdout)'
      },
      {
        flags: '--exclude, -e <pattern>',
        description: 'Exclude files matching pattern'
      },
      {
        flags: '--max-binary-size <bytes>',
        description: 'Limit maximum size of a single binary file'
      }
    ],
    examples: [
      'jref bpack . > archive.json',
      'jref bpack src --output archive.json',
      'jref bpack . --exclude "node_modules/**"'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, targetDir } = this.parseArgs(args);
      const rootDir = targetDir ? resolve(targetDir) : process.cwd();

      if (!existsSync(rootDir)) {
        return this.error(`Directory not found: ${rootDir}`, options);
      }

      const files: Record<string, string> = {};
      const encodings: Record<string, 'utf8' | 'base64'> = {};
      const filePaths: string[] = [];

      const ig = (ignore as any)().add(flags.exclude || []);
      // Add default ignores
      ig.add(['.git/**', 'node_modules/**', '.DS_Store']);

      const walk = (dir: string) => {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relPath = relative(rootDir, fullPath);

          if (ig.ignores(relPath)) continue;

          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile()) {
            const buffer = readFileSync(fullPath);
            const size = buffer.length;

            if (flags.maxBinarySize && size > flags.maxBinarySize) {
              if (!options.silent) {
                console.error(`⚠️  Skipping large file: ${relPath} (${size} bytes)`);
              }
              continue;
            }

            const encoding = getFileEncoding(buffer);
            const content = encoding === 'base64' ? encodeBase64(buffer) : buffer.toString('utf8');

            files[relPath] = content;
            if (encoding === 'base64') {
              encodings[relPath] = encoding;
            }
            filePaths.push(relPath);
          }
        }
      };

      if (!options.silent) {
        console.error(`📦 Archiving ${rootDir}...`);
      }

      walk(rootDir);

      const snapshot: ProjectSnapshot = {
        directoryStructure: generateDirectoryStructure(filePaths),
        encodings: Object.keys(encodings).length > 0 ? encodings : undefined,
        files
      };

      const output = JSON.stringify(snapshot, null, 2);

      if (flags.output) {
        await writeFile(flags.output, output);
        return this.success(`Archive created: ${flags.output} (${filePaths.length} files)`);
      }

      if (options.json || options.silent) {
        return this.success(output);
      }

      process.stdout.write(output + '\n');
      return this.success();

    } catch (err) {
      return this.error(`BPack failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: BPackFlags; targetDir?: string } {
    const flags: BPackFlags = {
      exclude: []
    };
    let targetDir: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--output' || arg === '-o') {
        flags.output = args[++i];
      } else if (arg === '--exclude' || arg === '-e') {
        flags.exclude!.push(args[++i]);
      } else if (arg === '--max-binary-size') {
        flags.maxBinarySize = parseInt(args[++i], 10);
      } else if (!arg.startsWith('-')) {
        targetDir = arg;
      }
    }

    return { flags, targetDir };
  }
}
