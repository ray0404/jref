/**
 * Inspect Command
 * Views directoryStructure and metadata without loading entire file into memory
 * Supports streaming for large JSON snapshots
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { printTable, printHeader } from '../utils/output.js';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { getMagicNumbers, detectMimeType } from '../utils/binary.js';

export class InspectCommand extends Command {
  readonly definition = {
    name: 'inspect',
    description: 'View directoryStructure and metadata without loading entire file',
    usage: 'jref inspect [options] [file]',
    options: [
      {
        flags: '--metadata, -m',
        description: 'Show only metadata (file count, total size, etc.)'
      },
      {
        flags: '--structure, -t',
        description: 'Show only directory structure (ASCII tree)'
      },
      {
        flags: '--files, -f',
        description: 'Show only file list with sizes'
      },
      {
        flags: '--summary',
        description: 'Show instructions, summary, and custom header'
      }
    ],
    examples: [
      'jref inspect snapshot.json',
      'jref inspect --metadata snapshot.json',
      'jref inspect --structure snapshot.json',
      'cat snapshot.json | jref inspect',
      'jref inspect --json snapshot.json'
    ],
    workflows: [
      'Streaming Analysis: Uses a streaming parser to analyze large snapshots without loading them into RAM.',
      'Metadata Extraction: Quickly verify snapshot contents before performing expensive operations.',
      'Structure Preview: View the project organization at a glance.',
      'Context Review: Examine instructions and summaries provided for AI agents.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args);

      let snapshot: any = { files: {} };
      let fileSizes: Record<string, number> = {};
      let decodedSizes: Record<string, number> = {};
      let encodings: Record<string, string> = {};
      let mimeTypes: Record<string, string> = {};
      let filePreviews: Record<string, string> = {};
      let totalSize = 0;
      let totalDecodedSize = 0;
      let binarySize = 0;
      let textSize = 0;
      let fileCount = 0;
      let binaryCount = 0;
      let textCount = 0;

      if (options.jq) {
        // Use full loading when JQ is active
        const fullSnapshot = await this.getSnapshot(context, options, filePath);
        snapshot = fullSnapshot;
        const snapshotEncodings = fullSnapshot.encodings || {};
        for (const [path, content] of Object.entries(fullSnapshot.files)) {
          const isBinary = snapshotEncodings[path] === 'base64';
          const size = Buffer.byteLength(content as string, 'utf8');
          const decodedSize = isBinary ? Buffer.byteLength(content as string, 'base64') : size;
          
          fileSizes[path] = size;
          decodedSizes[path] = decodedSize;
          totalSize += size;
          totalDecodedSize += decodedSize;
          fileCount++;

          if (isBinary) {
            binaryCount++;
            binarySize += decodedSize;
            encodings[path] = 'base64';
            mimeTypes[path] = detectMimeType(getMagicNumbers(content as string));
          } else {
            textCount++;
            textSize += size;
          }
        }
      } else {
        // Use streaming processor to avoid OOM
        const inputStream = filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin);
        await processSnapshot(
          inputStream,
          {
            onMetadata: (key, value) => {
              if (key === 'encodings') {
                Object.assign(encodings, value);
              } else {
                snapshot[key] = value;
              }
            },
            onFile: (path, content) => {
              const isBinary = encodings[path] === 'base64';
              const size = Buffer.byteLength(content, 'utf8');
              const decodedSize = isBinary ? Buffer.byteLength(content, 'base64') : size;

              fileSizes[path] = size;
              decodedSizes[path] = decodedSize;
              totalSize += size;
              totalDecodedSize += decodedSize;
              fileCount++;

              if (isBinary) {
                binaryCount++;
                binarySize += decodedSize;
                mimeTypes[path] = detectMimeType(getMagicNumbers(content));
              } else {
                textCount++;
                textSize += size;
                // Store preview in case it's actually binary but encodings hasn't arrived
                filePreviews[path] = content.slice(0, 32);
              }
            }
          }
        );
      }

      // Post-process: handle files where encodings metadata arrived AFTER the file content
      for (const [path, encoding] of Object.entries(encodings)) {
          if (encoding === 'base64' && !mimeTypes[path] && filePreviews[path]) {
              mimeTypes[path] = detectMimeType(getMagicNumbers(filePreviews[path]));
              // Note: summary metadata counts might be slightly off in this streaming edge case
              // but MIME identification will be correct.
          }
      }

      const metadata = {
        fileCount,
        totalSize: totalDecodedSize,
        binaryCount,
        textCount,
        binarySize,
        textSize,
        hasInstruction: Boolean(snapshot.instruction),
        hasFileSummary: Boolean(snapshot.fileSummary),
        hasUserProvidedHeader: Boolean(snapshot.userProvidedHeader),
        directoryStructureLines: snapshot.directoryStructure
          ? snapshot.directoryStructure.split('\n').length
          : 0
      };

      // Show header in human mode
      if (!options.silent && !options.raw && !options.json) {
        printHeader(options);
      }

      // Determine what to show
      const showMeta = (flags.metadata as boolean) || false;
      const showStructure = (flags.structure as boolean) || false;
      const showFiles = (flags.files as boolean) || false;
      const showSummary = (flags.summary as boolean) || false;

      // If no specific flags, show everything
      const showAll = !showMeta && !showStructure && !showFiles && !showSummary;

      const inspectData = {
        metadata,
        directoryStructure: snapshot.directoryStructure,
        filePaths: Object.keys(fileSizes),
        encodings,
        mimeTypes,
        instruction: snapshot.instruction,
        fileSummary: snapshot.fileSummary,
        userProvidedHeader: snapshot.userProvidedHeader
      };

      if (options.json) {
        const result: Record<string, unknown> = {};

        if (showAll || showMeta) {
          result.metadata = metadata;
        }
        if (showAll || showStructure) {
          result.directoryStructure = snapshot.directoryStructure;
        }
        if (showAll || showFiles) {
          result.filePaths = Object.keys(fileSizes);
          result.encodings = encodings;
          result.mimeTypes = mimeTypes;
        }
        if (showAll || showSummary) {
          if (snapshot.instruction) result.instruction = snapshot.instruction;
          if (snapshot.fileSummary) result.fileSummary = snapshot.fileSummary;
          if (snapshot.userProvidedHeader) result.userProvidedHeader = snapshot.userProvidedHeader;
        }

        this.print(result, options);
      } else {
        // Human-readable output
        if (showAll || showMeta) {
          this.printMetadata(metadata, options);
        }
        if (showAll || showStructure) {
          this.printStructure(snapshot.directoryStructure, options);
        }
        if (showAll || showFiles) {
          this.printFileList(decodedSizes, options, encodings, mimeTypes);
        }
        if (showAll || showSummary) {
          this.printSummary(snapshot, options);
        }
      }

      return this.success(undefined, inspectData);
    } catch (err) {
      return this.error(`Inspect failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): { flags: Record<string, unknown>; filePath?: string } {
    const flags: Record<string, unknown> = {};
    let filePath: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--metadata':
        case '-m':
          flags.metadata = true;
          break;
        case '--structure':
        case '-t':
          flags.structure = true;
          break;
        case '--files':
        case '-f':
          flags.files = true;
          break;
        case '--summary':
          flags.summary = true;
          break;
        default:
          if (!arg.startsWith('-')) {
            filePath = arg;
          }
      }
    }

    return { flags, filePath };
  }

  private printMetadata(metadata: any, options: CLIOptions): void {
    if (options.json) {
      this.print(metadata, options);
      return;
    }

    console.log('\n📊 SNAPSHOT METADATA');
    console.log('─'.repeat(40));
    
    const rows = [
      ['Total Files', metadata.fileCount.toString()],
      ['Source Files', metadata.textCount.toString()],
      ['Binary Assets', metadata.binaryCount.toString()],
      ['Total Size (decoded)', this.formatBytes(metadata.totalSize)],
      ['Text Payload', this.formatBytes(metadata.textSize)],
      ['Binary Payload', this.formatBytes(metadata.binarySize)],
      ['Tree Lines', metadata.directoryStructureLines.toString()],
      ['Has Instructions', metadata.hasInstruction ? 'Yes' : 'No'],
      ['Has File Summary', metadata.hasFileSummary ? 'Yes' : 'No']
    ];

    printTable(['Property', 'Value'], rows, options);
    console.log();
  }

  private printStructure(structure: string, options: CLIOptions): void {
    if (options.json) {
      this.print({ directoryStructure: structure }, options);
      return;
    }

    console.log('\n📁 DIRECTORY STRUCTURE');
    console.log('─'.repeat(40));
    console.log(structure || '(empty)');
    console.log();
  }

  private printFileList(fileSizes: Record<string, number>, options: CLIOptions, encodings: Record<string, string> = {}, mimeTypes: Record<string, string> = {}): void {
    const files = Object.keys(fileSizes);

    if (options.json) {
      this.print({ filePaths: files }, options);
      return;
    }

    console.log('\n📄 FILES');
    console.log('─'.repeat(40));

    if (files.length === 0) {
      console.log('(no files)');
    } else {
      const fileData = files.map((f) => [
        encodings[f] === 'base64' ? 'B' : 'T',
        f,
        this.formatBytes(fileSizes[f]),
        mimeTypes[f] || (encodings[f] === 'base64' ? 'application/octet-stream' : 'text/plain')
      ]);
      printTable(['Type', 'Path', 'Size', 'MIME Type'], fileData, options);
    }
    console.log();
  }

  private printSummary(
    snapshot: { instruction?: string; fileSummary?: string; userProvidedHeader?: string },
    options: CLIOptions
  ): void {
    if (options.json) {
      const result: Record<string, string> = {};
      if (snapshot.instruction) result.instruction = snapshot.instruction;
      if (snapshot.fileSummary) result.fileSummary = snapshot.fileSummary;
      if (snapshot.userProvidedHeader) result.userProvidedHeader = snapshot.userProvidedHeader;
      this.print(result, options);
      return;
    }

    if (snapshot.userProvidedHeader) {
      console.log('\n📌 CUSTOM HEADER');
      console.log('─'.repeat(40));
      console.log(snapshot.userProvidedHeader);
      console.log();
    }

    if (snapshot.fileSummary) {
      console.log('\n📝 FILE SUMMARY');
      console.log('─'.repeat(40));
      console.log(snapshot.fileSummary);
      console.log();
    }

    if (snapshot.instruction) {
      console.log('\n💡 INSTRUCTIONS');
      console.log('─'.repeat(40));
      console.log(snapshot.instruction);
      console.log();
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
