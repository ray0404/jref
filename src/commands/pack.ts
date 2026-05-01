/**
 * Pack Command
 * Create a snapshot from a local directory using Repomix programmatic API
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { pack, runRemoteAction, isExplicitRemoteUrl, isValidShorthand } from 'repomix';
import { generateDirectoryStructure } from '../utils/streaming-json.js';
import { generateInstruction } from '../utils/instruction.js';

interface PackFlags {
  instruction?: string;
  summary?: string;
  maxSize?: number;
  outputStyle?: 'json' | 'markdown' | 'xml' | 'plain';
  branch?: string;
  commit?: string;
  compress?: boolean;
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  topFilesLength?: number;
  tokenLimit?: number;
}

export class PackCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'pack',
    description: 'Create a snapshot from a local directory or remote repository',
    usage: 'jref pack [directory|url] [options]',
    options: [
      {
        flags: '--instruction <text>',
        description: 'Add custom AI instructions to the snapshot'
      },
      {
        flags: '--summary <text>',
        description: 'Add a high-level file summary to the snapshot'
      },
      {
        flags: '--max-size <bytes>',
        description: 'Split snapshot into chunks if it exceeds this size (JSON only)'
      },
      {
        flags: '-s, --output-style <json|markdown|xml|plain>',
        description: 'Choose output format optimized for different LLMs'
      },
      {
        flags: '--branch <name>',
        description: 'Target a specific branch for remote repositories'
      },
      {
        flags: '--commit <hash>',
        description: 'Target a specific commit for remote repositories'
      },
      {
        flags: '--compress',
        description: 'Enable source code compression (removes unnecessary whitespace)'
      },
      {
        flags: '--remove-comments',
        description: 'Strip code comments from the output'
      },
      {
        flags: '--remove-empty-lines',
        description: 'Strip blank lines from the output'
      },
      {
        flags: '--top-files-length <number>',
        description: 'Limit the number of top-level files processed'
      },
      {
        flags: '--token-limit <number>',
        description: 'Set a maximum token limit for the output'
      }
    ],
    examples: [
      'jref pack . > snapshot.json',
      'jref pack https://github.com/user/repo --branch main > snapshot.json',
      'jref pack . --output-style markdown --compress > project.md',
      'jref pack github:user/repo --remove-comments --top-files-length 50 > snapshot.json'
    ],
    workflows: [
      'Codebase Snapshotting: Capture the current state of a project for archival or sharing.',
      'Remote Packing: Snapshot public or private repositories by providing a URL (GitHub, GitLab, Bitbucket).',
      'Token Authentication: Uses GITHUB_TOKEN or GITLAB_TOKEN from the environment for private repositories.',
      'Agent Priming: Create snapshots with custom instructions to guide AI behavior.',
      'Chunked Packing: Manage large projects by splitting them into smaller, manageable snapshots.',
      'Token Optimization: Reduce context overhead using compression, comment stripping, and file limits.',
      'Multi-Format Export: Output to Markdown or XML for better readability in LLM chat interfaces.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, targetDir } = this.parseArgs(args);
      
      const isRemote = targetDir && (isExplicitRemoteUrl(targetDir) || isValidShorthand(targetDir));
      let result: any;
      let rootDir = process.cwd();

      // Validate flag combinations
      if (flags.maxSize && flags.outputStyle && flags.outputStyle !== 'json') {
        console.error(`⚠️  Warning: --max-size chunking is only supported for JSON output. Proceeding without chunking.`);
        flags.maxSize = undefined;
      }

      const outputStyle = flags.outputStyle || 'json';

      if (isRemote && targetDir) {
        if (!options.silent) {
          console.error(`📦 Packing remote repository ${targetDir} using Repomix...`);
        }
        
        // Prepare CLI-style options for remote action
        const cliOptions: any = {
          style: outputStyle,
          securityCheck: true,
          fileSummary: !!flags.summary,
          directoryStructure: true,
          includeFullDirectoryStructure: true,
          verbose: !options.silent,
          quiet: options.silent,
          compress: !!flags.compress,
          removeComments: !!flags.removeComments,
          removeEmptyLines: !!flags.removeEmptyLines,
          topFilesLength: flags.topFilesLength || 100
        };

        // Handle branch/commit for remote repositories
        if (flags.branch) cliOptions.branch = flags.branch;
        if (flags.commit) cliOptions.commit = flags.commit;

        const actionResult = await runRemoteAction(targetDir, cliOptions);
        result = actionResult.packResult;

        // If not JSON, we need to read the generated file
        if (outputStyle !== 'json') {
          const outputFiles = result.outputFiles as string[] | undefined;
          if (outputFiles && outputFiles.length > 0) {
            const outputFilePath = outputFiles[0];
            if (existsSync(outputFilePath)) {
              const output = readFileSync(outputFilePath, 'utf8');
              // Clean up temp file
              unlinkSync(outputFilePath);
              
              if (options.json || options.silent) {
                return this.success(output);
              }
              process.stdout.write(output + '\n');
              return this.success();
            }
          }
        }

      } else {
        rootDir = targetDir ? resolve(targetDir) : process.cwd();

        if (!existsSync(rootDir)) {
          return this.error(`Directory not found: ${rootDir}`, options);
        }

        const outputFileName = `repomix-output.${outputStyle === 'json' ? 'json' : outputStyle === 'markdown' ? 'md' : outputStyle === 'xml' ? 'xml' : 'txt'}`;

        // Prepare repomix configuration with explicit defaults
        const config: any = {
          cwd: rootDir,
          input: {
            maxFileSize: 10 * 1024 * 1024,
          },
          output: {
            filePath: outputFileName,
            style: outputStyle,
            parsableStyle: true,
            fileSummary: !!flags.summary,
            directoryStructure: true,
            files: true,
            removeComments: !!flags.removeComments,
            removeEmptyLines: !!flags.removeEmptyLines,
            showLineNumbers: false,
            copyToClipboard: false,
            includeFullDirectoryStructure: true,
            compress: !!flags.compress,
            topFilesLength: flags.topFilesLength || 100,
            truncateBase64: true,
            git: {
                sortByChanges: false,
                sortByChangesMaxCommits: 10,
                includeDiffs: false,
                includeLogs: false,
                includeLogsCount: 10
            },
            tokenCountTree: !!flags.tokenLimit
          },
          include: [],
          ignore: {
            useGitignore: false, // Set to false to avoid interference in tests
            useDotIgnore: true,
            useDefaultPatterns: true,
            customPatterns: [],
          },
          security: {
            enableSecurityCheck: true,
          },
          tokenCount: {
            encoding: 'cl100k_base'
          }
        };

        if (!options.silent) {
          console.error(`📦 Packing ${rootDir} using Repomix...`);
        }

        // Use absolute path for packing
        result = await pack([rootDir], config);

        // If not JSON, read the file and output
        if (outputStyle !== 'json') {
          const outputFilePath = resolve(rootDir, outputFileName);
          if (existsSync(outputFilePath)) {
            const output = readFileSync(outputFilePath, 'utf8');
            // Clean up
            unlinkSync(outputFilePath);

            if (options.json || options.silent) {
              return this.success(output);
            }
            process.stdout.write(output + '\n');
            return this.success();
          }
        }
      }
      
      if (!options.silent) {
        console.error(`✅ Packed ${result.processedFiles?.length || 0} files.`);
      }

      // Handle instruction generation (JSON style only beyond this point)
      const instruction = flags.instruction || (isRemote ? 'Analyze this codebase snapshot.' : await generateInstruction(rootDir));

      // Convert repomix result to jref snapshot format
      const allFiles: Record<string, string> = {};
      if (result.processedFiles) {
        for (const file of result.processedFiles) {
          allFiles[file.path] = file.content;
        }
      }

      // Helper to create a snapshot object
      const createSnapshot = (filesMap: Record<string, string>): ProjectSnapshot => ({
        directoryStructure: generateDirectoryStructure(Object.keys(filesMap)),
        files: filesMap,
        instruction,
        fileSummary: flags.summary
      });

      // Handle Chunking (Feature 4)
      if (flags.maxSize && flags.maxSize > 0) {
        const sortedPaths = Object.keys(allFiles).sort();
        let currentChunkFiles: Record<string, string> = {};
        let currentChunkSize = 0;
        let chunkIndex = 1;
        const totalFiles = sortedPaths.length;

        for (let i = 0; i < totalFiles; i++) {
          const path = sortedPaths[i];
          const content = allFiles[path];
          const fileSize = Buffer.byteLength(path + content, 'utf8');

          // If adding this file exceeds the limit, emit current chunk
          if (currentChunkSize + fileSize > flags.maxSize && Object.keys(currentChunkFiles).length > 0) {
            const snapshot = createSnapshot(currentChunkFiles);
            const chunkPath = `snapshot.part${chunkIndex}.json`;
            writeFileSync(chunkPath, JSON.stringify(snapshot, null, 2));
            if (!options.silent) {
              console.error(`📦 Wrote chunk ${chunkIndex} to ${chunkPath} (${currentChunkSize} bytes)`);
            }
            
            // Reset for next chunk
            currentChunkFiles = {};
            currentChunkSize = 0;
            chunkIndex++;
          }

          currentChunkFiles[path] = content;
          currentChunkSize += fileSize;
        }

        // Emit final chunk
        if (Object.keys(currentChunkFiles).length > 0) {
          const snapshot = createSnapshot(currentChunkFiles);
          const chunkPath = `snapshot.part${chunkIndex}.json`;
          writeFileSync(chunkPath, JSON.stringify(snapshot, null, 2));
          if (!options.silent) {
            console.error(`📦 Wrote final chunk ${chunkIndex} to ${chunkPath} (${currentChunkSize} bytes)`);
          }
        }

        return this.success(`Chunking complete. Created ${chunkIndex} snapshot parts.`);
      }

      // Normal single-file output
      const snapshot = createSnapshot(allFiles);
      const output = JSON.stringify(snapshot, null, 2);
      
      if (options.json || options.silent) {
        return this.success(output);
      }

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
      } else if (arg === '--max-size') {
        flags.maxSize = parseInt(args[++i], 10);
      } else if (arg === '-s' || arg === '--output-style') {
        flags.outputStyle = args[++i] as any;
      } else if (arg === '--branch') {
        flags.branch = args[++i];
      } else if (arg === '--commit') {
        flags.commit = args[++i];
      } else if (arg === '--compress') {
        flags.compress = true;
      } else if (arg === '--remove-comments') {
        flags.removeComments = true;
      } else if (arg === '--remove-empty-lines') {
        flags.removeEmptyLines = true;
      } else if (arg === '--top-files-length') {
        flags.topFilesLength = parseInt(args[++i], 10);
      } else if (arg === '--token-limit') {
        flags.tokenLimit = parseInt(args[++i], 10);
      } else if (!arg.startsWith('-')) {
        targetDir = arg;
      }
    }

    return { flags, targetDir };
  }
}
