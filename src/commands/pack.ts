/**
 * Pack Command
 * Create a snapshot from a local directory using Repomix programmatic API
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { resolve, relative, join } from 'path';
import { pack, runRemoteAction, isExplicitRemoteUrl, isValidShorthand } from 'repomix';
import { generateDirectoryStructure } from '../utils/streaming-json.js';
import { generateInstruction } from '../utils/instruction.js';
import { isBinaryBuffer, encodeBase64 } from '../utils/binary.js';
import { chunkCode } from '../utils/chunking.js';
import { generateEmbedding } from '../utils/embeddings.js';
import { generateFileHashMap, getDeltaPaths, type FileHashMap } from '../utils/hashing.js';
import { readFromInput } from '../utils/input.js';

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
  includeBinaries?: boolean;
  maxBinarySize?: number;
  semantic?: boolean;
  hashes?: boolean;
  delta?: string | boolean;
  stream?: boolean;
}

export class PackCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'pack',
    description: 'Create a snapshot from a local directory or remote repository',
    usage: 'jref pack [directory|url] [options]',
    options: [
      {
        flags: '--semantic',
        description: 'Enable AST-aware semantic chunking and local embeddings'
      },
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
      },
      {
        flags: '--include-binaries',
        description: 'Include binary files encoded as Base64 in the snapshot'
      },
      {
        flags: '--max-binary-size <bytes>',
        description: 'Maximum size for a single binary file to be included'
      },
      {
        flags: '--hashes',
        description: 'Output a hash map of the directory files instead of a snapshot'
      },
      {
        flags: '--delta [remote-hashes]',
        description: 'Create a delta snapshot based on remote hashes (reads from stdin if no file given)'
      },
      {
        flags: '--stream',
        description: 'Enable real-time streaming mode for piped synchronization'
      }
    ],
    examples: [
      'jref pack . > snapshot.json',
      'jref pack . --include-binaries --max-binary-size 1048576 > snapshot.json',
      'jref pack https://github.com/user/repo --branch main > snapshot.json',
      'jref pack . --output-style markdown --compress > project.md',
      'jref pack . --hashes > local.hashes.json',
      'jref pack . --delta remote.hashes.json > delta.json',
      'ssh remote "jref pack . --hashes" | jref pack . --delta --stream | ssh remote "jref extract --listen"'
    ],
    workflows: [
      'Codebase Snapshotting: Capture the current state of a project for archival or sharing.',
      'Remote Packing: Snapshot public or private repositories by providing a URL (GitHub, GitLab, Bitbucket).',
      'Hybrid Snapshot: Use --include-binaries to bundle code and assets (images, icons) together.',
      'Token Optimization: Reduce context overhead using compression, comment stripping, and file limits.',
      'Chunked Packing: Manage large projects by splitting them into smaller, manageable snapshots.',
      'Delta Syncing: Minimize transfer size by sending only changed files between environments.'
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
      let rootDir = targetDir ? resolve(targetDir) : process.cwd();

      if (!existsSync(rootDir) && !isRemote) {
        return this.error(`Directory not found: ${rootDir}`, options);
      }

      // Handle --hashes flag
      if (flags.hashes) {
        const hashMap = generateFileHashMap(rootDir);
        const output = JSON.stringify(hashMap, null, 2);
        if (options.json || options.silent) {
          return this.success(output);
        }
        process.stdout.write(output + '\n');
        return this.success();
      }

      // Handle --delta flag
      let deltaPaths: string[] | undefined;
      if (flags.delta) {
        let remoteHashMap: FileHashMap;
        if (typeof flags.delta === 'string' && existsSync(flags.delta)) {
          remoteHashMap = JSON.parse(readFileSync(flags.delta, 'utf8'));
        } else {
          // Read from stdin
          if (!options.silent) console.error('📥 Reading remote hashes from stdin...');
          const input = await readFromInput();
          remoteHashMap = JSON.parse(input);
        }
        
        const localHashMap = generateFileHashMap(rootDir);
        deltaPaths = getDeltaPaths(localHashMap, remoteHashMap);
        
        if (!options.silent) {
          console.error(`🔍 Delta analysis: ${deltaPaths.length} files changed/new.`);
        }

        if (deltaPaths.length === 0) {
          if (!options.silent) console.error('✅ No changes detected.');
          return this.success(options.json ? JSON.stringify({ message: 'No changes detected', files: [] }) : 'No changes detected.');
        }
      }

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
        const outputFileName = `repomix-output.${outputStyle === 'json' ? 'json' : outputStyle === 'markdown' ? 'md' : outputStyle === 'xml' ? 'xml' : 'txt'}`;

        // Prepare repomix configuration
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
          include: deltaPaths || [],
          ignore: {
            useGitignore: false,
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

      // Handle semantic chunking and embeddings
      const allChunks: any[] = [];
      if (flags.semantic) {
        if (!options.silent) {
          console.error(`🧠 Generating semantic embeddings for code chunks...`);
        }
        if (result.processedFiles) {
          for (const file of result.processedFiles) {
            // Only chunk text files that look like code
            const isCode = /\.(ts|tsx|js|jsx|py|zig|rs|c|cpp|h|hpp)$/.test(file.path);
            if (isCode) {
              const chunks = chunkCode(file.path, file.content);
              for (const chunk of chunks) {
                try {
                  chunk.embedding = await generateEmbedding(chunk.content);
                  allChunks.push(chunk);
                } catch (err) {
                  if (!options.silent) console.error(`⚠️  Failed to embed chunk in ${file.path}: ${(err as Error).message}`);
                }
              }
            }
          }
        }
        if (!options.silent) {
          console.error(`✅ Generated ${allChunks.length} semantic chunks.`);
        }
      }

      // Handle instruction generation (JSON style only beyond this point)
      const instruction = flags.instruction || (isRemote ? 'Analyze this codebase snapshot.' : await generateInstruction(rootDir));

      // Convert repomix result to jref snapshot format
      const allFiles: Record<string, string> = {};
      const encodings: Record<string, 'utf8' | 'base64'> = {};

      if (result.processedFiles) {
        for (const file of result.processedFiles) {
          allFiles[file.path] = file.content;
        }
      }

      // Hybrid mode: Append binaries
      if (flags.includeBinaries && !isRemote) {
        if (!options.silent) {
          console.error(`🔍 Post-processing: Scanning for binaries to append...`);
        }
        const binaryScanWalk = (dir: string) => {
          const entries = readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            const relPath = relative(rootDir, fullPath);

            // Basic safety/speed ignores for hybrid scan
            if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;

            if (entry.isDirectory()) {
              binaryScanWalk(fullPath);
            } else if (entry.isFile()) {
              // If already in allFiles, we trust repomix unless it's truncated
              if (allFiles[relPath]) continue;
              
              // If in delta mode, only include if it was in deltaPaths
              if (deltaPaths && !deltaPaths.includes(relPath)) continue;

              const buffer = readFileSync(fullPath);
              if (isBinaryBuffer(buffer)) {
                if (flags.maxBinarySize && buffer.length > flags.maxBinarySize) {
                  if (!options.silent) console.error(`⚠️  Skipping large binary: ${relPath} (${buffer.length} bytes)`);
                  continue;
                }
                allFiles[relPath] = encodeBase64(buffer);
                encodings[relPath] = 'base64';
              }
            }
          }
        };
        binaryScanWalk(rootDir);
      }

      // Helper to create a snapshot object
      const createSnapshot = (filesMap: Record<string, string>, encodingMap?: Record<string, any>): ProjectSnapshot => ({
        directoryStructure: generateDirectoryStructure(Object.keys(filesMap)),
        encodings: encodingMap && Object.keys(encodingMap).length > 0 ? encodingMap : undefined,
        files: filesMap,
        instruction,
        fileSummary: flags.summary,
        chunks: allChunks.length > 0 ? allChunks : undefined
      });

      // Handle Chunking
      if (flags.maxSize && flags.maxSize > 0) {
        const sortedPaths = Object.keys(allFiles).sort();
        let currentChunkFiles: Record<string, string> = {};
        let currentChunkEncodings: Record<string, 'base64'> = {};
        let currentChunkSize = 0;
        let chunkIndex = 1;
        const totalFiles = sortedPaths.length;

        for (let i = 0; i < totalFiles; i++) {
          const path = sortedPaths[i];
          const content = allFiles[path];
          const fileSize = Buffer.byteLength(path + content, 'utf8');

          // If adding this file exceeds the limit, emit current chunk
          if (currentChunkSize + fileSize > flags.maxSize && Object.keys(currentChunkFiles).length > 0) {
            const snapshot = createSnapshot(currentChunkFiles, currentChunkEncodings);
            const chunkPath = `snapshot.part${chunkIndex}.json`;
            writeFileSync(chunkPath, JSON.stringify(snapshot, null, 2));
            if (!options.silent) {
              console.error(`📦 Wrote chunk ${chunkIndex} to ${chunkPath} (${currentChunkSize} bytes)`);
            }
            
            // Reset for next chunk
            currentChunkFiles = {};
            currentChunkEncodings = {};
            currentChunkSize = 0;
            chunkIndex++;
          }

          currentChunkFiles[path] = content;
          if (encodings[path]) currentChunkEncodings[path] = encodings[path] as any;
          currentChunkSize += fileSize;
        }

        // Emit final chunk
        if (Object.keys(currentChunkFiles).length > 0) {
          const snapshot = createSnapshot(currentChunkFiles, currentChunkEncodings);
          const chunkPath = `snapshot.part${chunkIndex}.json`;
          writeFileSync(chunkPath, JSON.stringify(snapshot, null, 2));
          if (!options.silent) {
            console.error(`📦 Wrote final chunk ${chunkIndex} to ${chunkPath} (${currentChunkSize} bytes)`);
          }
        }

        return this.success(`Chunking complete. Created ${chunkIndex} snapshot parts.`);
      }

      // Normal single-file output
      const snapshot = createSnapshot(allFiles, encodings);
      
      // If streaming mode, wrap in protocol markers
      if (flags.stream) {
        const payload = JSON.stringify({
            jref_protocol: '1.0',
            type: deltaPaths ? 'delta' : 'snapshot',
            timestamp: Date.now(),
            ...snapshot
        });
        // Use a clear boundary marker
        process.stdout.write('\n--JREF-START--\n');
        process.stdout.write(payload + '\n');
        process.stdout.write('--JREF-END--\n');
        return this.success();
      }

      const output = JSON.stringify(snapshot, null, 2);
      
      if (options.json || options.silent) {
        return this.success(output);
      }

      process.stdout.write(output + '\n');
      return this.success();

    } catch (err) {
      if ((err as any).code === 'EPIPE') {
        return this.success(); // Silent exit on broken pipe
      }
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
      } else if (arg === '--include-binaries') {
        flags.includeBinaries = true;
      } else if (arg === '--semantic') {
        flags.semantic = true;
      } else if (arg === '--max-binary-size') {
        flags.maxBinarySize = parseInt(args[++i], 10);
      } else if (arg === '--hashes') {
        flags.hashes = true;
      } else if (arg === '--delta') {
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
            flags.delta = args[++i];
        } else {
            flags.delta = true;
        }
      } else if (arg === '--stream') {
        flags.stream = true;
      } else if (!arg.startsWith('-')) {
        targetDir = arg;
      }
    }

    return { flags, targetDir };
  }
}
