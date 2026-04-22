/**
 * Inspect Command
 * Views directoryStructure and metadata without loading entire file into memory
 * Supports streaming for large JSON snapshots
 */

import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, SnapshotMetadata } from '../types/index.js';
import { processSnapshot } from '../utils/streaming-json.js';
import { printTable, printHeader } from '../utils/output.js';
import { createReadStream } from 'fs';

export class InspectCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'inspect',
    description: 'View directoryStructure and metadata without loading entire file',
    usage: 'jref inspect [options] [file]',
    examples: [
      'jref inspect snapshot.json',
      'jref inspect --metadata snapshot.json',
      'jref inspect --structure snapshot.json',
      'cat snapshot.json | jref inspect',
      'jref inspect --json snapshot.json'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, filePath } = this.parseArgs(args);

      const snapshot: any = { files: {} };
      const fileSizes: Record<string, number> = {};
      let totalSize = 0;
      let fileCount = 0;

      // Use streaming processor to avoid OOM
      await processSnapshot(
        filePath ? createReadStream(filePath) : (context.stdinIsPipe ? Readable.from([context.stdin!]) : process.stdin),
        {
          onMetadata: (key, value) => {
            snapshot[key] = value;
          },
          onFile: (path, content) => {
            const size = Buffer.byteLength(content, 'utf8');
            fileSizes[path] = size;
            totalSize += size;
            fileCount++;
          }
        }
      );

      const metadata: SnapshotMetadata = {
        fileCount,
        totalSize,
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
          this.printFileList(fileSizes, options);
        }
        if (showAll || showSummary) {
          this.printSummary(snapshot, options);
        }
      }

      return this.success();
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

  private printMetadata(metadata: SnapshotMetadata, options: CLIOptions): void {
    if (options.json) {
      this.print(metadata, options);
      return;
    }

    console.log('\n📊 SNAPSHOT METADATA');
    console.log('─'.repeat(40));
    printTable(
      ['Property', 'Value'],
      [
        ['Files', metadata.fileCount.toString()],
        ['Total Size', this.formatBytes(metadata.totalSize)],
        ['Directory Structure Lines', metadata.directoryStructureLines.toString()],
        ['Has Instructions', metadata.hasInstruction ? 'Yes' : 'No'],
        ['Has File Summary', metadata.hasFileSummary ? 'Yes' : 'No'],
        ['Has Custom Header', metadata.hasUserProvidedHeader ? 'Yes' : 'No']
      ],
      options
    );
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

  private printFileList(fileSizes: Record<string, number>, options: CLIOptions): void {
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
        f,
        this.formatBytes(fileSizes[f])
      ]);
      printTable(['Path', 'Size'], fileData, options);
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

import { Readable } from 'stream';
