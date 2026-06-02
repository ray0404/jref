import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { UMFS } from '../utils/umfs.js';
import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';

export class UMFSCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'umfs',
    description: 'Unified Metadata Filename Specification (UMFS) utilities',
    usage: 'jref umfs <action> [options] [args]',
    options: [
      { flags: '--project <name>', description: 'Project name for stringify' },
      { flags: '--ver <vXX-YY-ZZ>', description: 'Version string for stringify' },
      { flags: '--tag <tag>', description: 'Tag for stringify' },
      { flags: '--date <YYYYMMDD>', description: 'Date for stringify' },
      { flags: '--time <HHMM|HHMMSS>', description: 'Time for stringify' },
      { flags: '--ext <extension>', description: 'File extension for stringify' }
    ],
    examples: [
      'jref umfs validate my-app_v01-00-00_20260601.log',
      'jref umfs parse my-app_v01-00-00_20260601.log',
      'jref umfs stringify --project my-app --ver v01-00-00 --ext log',
      'jref umfs check-dir ./logs'
    ],
    workflows: [
      'Metadata Parsing: Extracts metadata fields from UMFS-compliant filenames.',
      'Validation: Audits filenames or directories for UMFS compliance.'
    ]
  };

  async execute(args: string[], options: CLIOptions, _context: CommandContext): Promise<CommandResult> {
    const action = args[0];
    if (!action) {
      return this.error('Action is required (validate, parse, stringify, check-dir)', options);
    }

    const parsedArgs = this.parseArgs(args);

    switch (action) {
      case 'validate': {
        const filename = args[1];
        if (!filename) return this.error('Filename required for validate', options);
        const isValid = UMFS.isValid(filename);
        if (options.json) {
          this.print({ filename, valid: isValid }, options);
          return isValid ? this.success(undefined, { filename, valid: true }) : this.error('Invalid', options);
        }
        return isValid 
          ? this.success('Valid UMFS filename', { filename, valid: true })
          : this.error('Invalid UMFS filename', options);
      }
      case 'parse': {
        const filename = args[1];
        if (!filename) return this.error('Filename required for parse', options);
        const parsed = UMFS.parse(filename);
        if (parsed) {
          if (options.json) {
            this.print(parsed, options);
            return this.success(undefined, parsed);
          }
          return this.success('Parsed successfully:\n' + JSON.stringify(parsed, null, 2), parsed);
        } else {
          return this.error('Failed to parse UMFS filename', options);
        }
      }
      case 'stringify': {
        try {
          const meta = {
            project: parsedArgs.project as string,
            version: (parsedArgs.version as string) || null,
            tag: (parsedArgs.tag as string) || null,
            date: (parsedArgs.date as string) || null,
            time: (parsedArgs.time as string) || null,
            ext: parsedArgs.ext as string
          };
          if (!meta.project || !meta.ext) {
            return this.error('--project and --ext are required for stringify', options);
          }
          const filename = UMFS.stringify(meta);
          if (options.json) {
            this.print({ filename }, options);
            return this.success(undefined, filename);
          }
          return this.success(filename, filename);
        } catch (err: any) {
          return this.error(`Stringify failed: ${err.message}`, options);
        }
      }
      case 'check-dir': {
        const dir = args[1] || '.';
        try {
          const files = readdirSync(dir);
          const results = files.map(file => {
            const isDir = statSync(resolve(dir, file)).isDirectory();
            if (isDir) return null;
            return { filename: file, valid: UMFS.isValid(file), parsed: UMFS.parse(file) };
          }).filter(Boolean);
          
          const allValid = results.every(r => r?.valid);
          if (options.json) {
             this.print(results, options);
             return allValid ? this.success(undefined, results) : this.error('Found non-compliant files', options);
          }
          
          if (allValid) {
            return this.success('All files are UMFS compliant', results);
          } else {
             const invalid = results.filter(r => !r?.valid).map(r => r?.filename);
             return this.error(`Found non-compliant files:\n${invalid.join('\n')}`, options);
          }
        } catch (err: any) {
          return this.error(`Directory check failed: ${err.message}`, options);
        }
      }
      default:
        return this.error(`Unknown action: ${action}`, options);
    }
  }

  protected parseArgs(args: string[]): Record<string, unknown> {
    const parsed: Record<string, unknown> = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--project') parsed.project = args[++i];
      else if (args[i] === '--ver') parsed.version = args[++i];
      else if (args[i] === '--tag') parsed.tag = args[++i];
      else if (args[i] === '--date') parsed.date = args[++i];
      else if (args[i] === '--time') parsed.time = args[++i];
      else if (args[i] === '--ext') parsed.ext = args[++i];
    }
    return parsed;
  }
}
