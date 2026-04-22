/**
 * Pack Command
 * Create a snapshot from a local directory using Repomix programmatic API
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { pack } from 'repomix';
import { generateDirectoryStructure } from '../utils/streaming-json.js';

interface PackFlags {
  instruction?: string;
  summary?: string;
}

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
      const rootDir = targetDir ? resolve(targetDir) : process.cwd();

      if (!existsSync(rootDir)) {
        return this.error(`Directory not found: ${rootDir}`, options);
      }

      // Prepare repomix configuration with explicit defaults to avoid undefined errors
      const config: any = {
        cwd: rootDir,
        input: {
          maxFileSize: 10 * 1024 * 1024,
        },
        output: {
          filePath: 'repomix-output.json', // Dummy path, we use stdout/processedFiles
          style: 'json',
          parsableStyle: true,
          fileSummary: !!flags.summary,
          directoryStructure: true,
          files: true,
          removeComments: false,
          removeEmptyLines: false,
          showLineNumbers: false,
          copyToClipboard: false,
          includeFullDirectoryStructure: true,
          compress: false,
          topFilesLength: 100,
          truncateBase64: true,
          git: {
              sortByChanges: false,
              sortByChangesMaxCommits: 10,
              includeDiffs: false,
              includeLogs: false,
              includeLogsCount: 10
          },
          tokenCountTree: false
        },
        include: [],
        ignore: {
          useGitignore: true,
          useDotIgnore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
        security: {
          enableSecurityCheck: false,
        },
        tokenCount: {
          encoding: 'cl100k_base'
        }
      };

      if (!options.silent) {
        console.error(`📦 Packing ${rootDir} using Repomix...`);
      }

      // Use '.' as input path when cwd is set to rootDir
      const result = await pack(['.'], config);
      
      if (!options.silent) {
        console.error(`✅ Packed ${result.processedFiles?.length || 0} files.`);
      }

      // Convert repomix result to jref snapshot format
      const files: Record<string, string> = {};
      if (result.processedFiles) {
        for (const file of result.processedFiles) {
          files[file.path] = file.content;
        }
      }

      const snapshot: ProjectSnapshot = {
        directoryStructure: generateDirectoryStructure(Object.keys(files)),
        files,
        instruction: flags.instruction,
        fileSummary: flags.summary
      };

      const output = JSON.stringify(snapshot, null, 2);
      
      if (options.json || options.silent) {
        return this.success(output);
      }

      // Default behavior is to print to stdout (which user can redirect)
      process.stdout.write(output + '\n');
      return this.success();

    } catch (err) {
      return this.error(`Pack failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: PackFlags; targetDir?: string } {
    const flags: PackFlags = {};
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
