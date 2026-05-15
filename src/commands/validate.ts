import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { existsSync, readFileSync, writeFileSync, lstatSync } from 'fs';
import { execSync } from 'child_process';
import { generateDirectoryStructure } from '../utils/streaming-json.js';
import { buildDependentGraph, getBlastRadius } from '../utils/dependency.js';

interface ValidateFlags {
  output?: string;
  depth?: number;
  all?: boolean;
}

export class ValidateCommand extends Command {
  readonly definition = {
    name: 'validate',
    description: 'Analyze git diff blast radius and generate AI validation context',
    usage: 'jref validate <target-branch> [options]',
    options: [
      {
        flags: '-o, --output <file>',
        description: 'Output the validation snapshot to a file'
      },
      {
        flags: '-d, --depth <number>',
        description: 'Maximum depth for dependency traversal (default: 1)'
      },
      {
        flags: '-a, --all',
        description: 'Include all tracked files in the snapshot (ignores blast radius)'
      }
    ],
    examples: [
      'jref validate main',
      'jref validate HEAD~1 --output validation.json',
      'jref validate origin/develop --depth 2'
    ],
    workflows: [
      'Pre-merge Intelligence: Automatically identify the "blast radius" of a diff and package only the relevant context for AI verification.',
      'Targeted Validation: Instead of sending the entire codebase to an LLM, send only the changed files and their direct/indirect dependents.',
      'Autonomous Guardrails: The generated snapshot includes a specialized instruction to force the LLM into boolean pass/fail logic.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { flags, targetBranch } = this.parseArgs(args);

      if (!targetBranch) {
        return this.error('Target branch/commit is required (e.g., jref validate main)', options);
      }

      const rootDir = process.cwd();

      // 1. Get changed files from git
      if (!options.silent) {
        console.error(`🔍 Analyzing git diff against ${targetBranch}...`);
      }
      const changedFiles = this.getChangedFiles(targetBranch);

      if (changedFiles.length === 0) {
        return this.success('No local changes detected relative to ' + targetBranch);
      }

      // 2. Identify all tracked files (for dependency resolution)
      const allFiles = this.getAllTrackedFiles();

      // 3. Resolve Blast Radius
      let filesToInclude: string[];
      if (flags.all) {
        filesToInclude = allFiles;
      } else {
        if (!options.silent) {
          console.error(`🕸️  Building dependency graph...`);
        }
        const graph = buildDependentGraph(rootDir, allFiles);
        const depth = flags.depth || 1;
        const blastRadius = getBlastRadius(changedFiles, graph, depth);
        
        if (!options.silent) {
          console.error(`🎯 Blast radius: ${blastRadius.length} affected dependents identified.`);
        }
        filesToInclude = Array.from(new Set([...changedFiles, ...blastRadius]));
      }

      // 4. Create Snapshot
      const snapshot = this.createValidationSnapshot(filesToInclude, changedFiles);

      const output = JSON.stringify(snapshot, null, 2);

      if (flags.output) {
        writeFileSync(flags.output, output);
        if (!options.silent) {
          console.error(`✅ Validation context saved to ${flags.output}`);
        }
      }

      if (options.json || options.silent) {
        return this.success(output, snapshot);
      }

      process.stdout.write(output + '\n');
      return this.success(undefined, snapshot);

    } catch (err) {
      return this.error(`Validation command failed: ${(err as Error).message}`, options);
    }
  }

  /**
   * Run git diff to get changed files
   */
  private getChangedFiles(target: string): string[] {
    try {
      // Get names of changed files (both staged and unstaged)
      const output = execSync(`git diff --name-only ${target}`, { encoding: 'utf8' });
      return output
        .split('\n')
        .map(f => f.trim())
        .filter(f => f && existsSync(f) && lstatSync(f).isFile());
    } catch (err) {
      throw new Error(`Failed to execute git diff: ${(err as Error).message}`);
    }
  }

  /**
   * Get all files tracked by git
   */
  private getAllTrackedFiles(): string[] {
    try {
      const output = execSync('git ls-files', { encoding: 'utf8' });
      return output
        .split('\n')
        .map(f => f.trim())
        .filter(f => f && existsSync(f));
    } catch (err) {
      throw new Error(`Failed to execute git ls-files: ${(err as Error).message}`);
    }
  }

  /**
   * Create the targeted ProjectSnapshot
   */
  private createValidationSnapshot(paths: string[], changedFiles: string[]): ProjectSnapshot {
    const files: Record<string, string> = {};

    for (const path of paths) {
      try {
        if (existsSync(path) && lstatSync(path).isFile()) {
          files[path] = readFileSync(path, 'utf8');
        }
      } catch {
        // Skip files that can't be read
      }
    }

    const changedList = changedFiles.join(', ');
    const dependents = paths.filter(p => !changedFiles.includes(p));
    const dependentList = dependents.length > 0 ? dependents.join(', ') : 'None identified';

    const instruction = `
Analyze the structural and logical changes in the provided project snapshot.

## Context
- **Mutated Files (The Change):** ${changedList}
- **Affected Perimeter (Blast Radius):** ${dependentList}

## Task
Perform a rigorous verification of the changes. Evaluate whether the modifications in the Mutated Files break any identified dependencies, violate type safety, or introduce logical inconsistencies in the Affected Perimeter.

## Output Format
You MUST respond with a valid JSON object only:
{
  "pass": boolean,
  "reason": "A concise explanation of the verification result, highlighting specific risks or confirming stability."
}

Set "pass" to true ONLY if the changes are structurally sound and logically compatible with the perimeter.
`.trim();

    return {
      directoryStructure: generateDirectoryStructure(paths),
      files,
      instruction
    };
  }

  protected parseArgs(args: string[]): { flags: ValidateFlags; targetBranch?: string } {
    const flags: ValidateFlags = {};
    let targetBranch: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--output' || arg === '-o') {
        flags.output = args[++i];
      } else if (arg === '--depth' || arg === '-d') {
        flags.depth = parseInt(args[++i], 10);
      } else if (arg === '--all' || arg === '-a') {
        flags.all = true;
      } else if (!arg.startsWith('-')) {
        targetBranch = arg;
      }
    }

    return { flags, targetBranch };
  }
}
