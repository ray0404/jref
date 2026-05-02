import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default class OpenAPICommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'openapi',
    description: 'Transform an OpenAPI/RESTful spec into a queryable jref snapshot',
    usage: 'jref openapi <spec.json>',
    options: [],
    examples: [
      'jref openapi tailscale-api.json > tailscale-snapshot.json',
      'jref openapi tailscale-api.json | jref query --path "/tailnet/{tailnet}/devices/GET.json"'
    ],
    workflows: [
      'API Exploration: Unpack a monolithic OpenAPI spec into a virtual filesystem.',
      'Agentic Routing: Provide LLMs with discrete, file-like API endpoints for easier tool construction.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { specPath } = this.parseArgs(args) as { specPath?: string };
      if (!specPath && !context.stdin) {
        return this.error('Requires an OpenAPI JSON file path or stdin.', options);
      }

      // Load the raw OpenAPI spec (bypassing jref's getSnapshot to avoid Zod schema failure)
      const rawSpec = specPath 
        ? JSON.parse(readFileSync(resolve(process.cwd(), specPath), 'utf-8'))
        : JSON.parse(context.stdin!);

      const virtualSnapshot = this.translateToSnapshot(rawSpec);

      // In human mode (no flags, TTY), show a progress message to stderr
      if (!options.json && !options.raw && !options.silent && process.stdout.isTTY) {
        console.error(`Successfully mapped ${Object.keys(virtualSnapshot.files).length} virtual endpoints.`);
      }

      this.print(virtualSnapshot, options);
      return this.success();
    } catch (err) {
      return this.error(`OpenAPI parsing failed: ${(err as Error).message}`, options);
    }
  }

  protected parseArgs(args: string[]): Record<string, unknown> {
    return {
      specPath: args[0]
    };
  }

  private translateToSnapshot(spec: any): ProjectSnapshot {
    const files: Record<string, string> = {};
    const title = spec.info?.title || 'OpenAPI';
    
    // 0. Map global metadata
    if (spec.servers) {
      files['metadata/servers.json'] = JSON.stringify(spec.servers, null, 2);
    }

    // 1. Map global definitions/components
    if (spec.components?.schemas) {
      for (const [schemaName, schemaObj] of Object.entries(spec.components.schemas)) {
        files[`components/schemas/${schemaName}.json`] = JSON.stringify(schemaObj, null, 2);
      }
    }

    // 2. Map endpoints to virtual files
    if (spec.paths) {
      for (const [pathUrl, methods] of Object.entries(spec.paths)) {
        // e.g., "/tailnet/{tailnet}/devices" -> "paths/tailnet/{tailnet}/devices"
        const cleanPath = pathUrl.replace(/^\//, ''); 
        
        for (const [method, details] of Object.entries(methods as Record<string, any>)) {
          const vFilePath = `paths/${cleanPath}/${method.toUpperCase()}.json`;
          files[vFilePath] = JSON.stringify({
            summary: details.summary,
            description: details.description,
            parameters: details.parameters || [],
            responses: details.responses || {}
          }, null, 2);
        }
      }
    }

    // 3. Generate a virtual tree for the directoryStructure
    const directoryStructure = this.generateTree(Object.keys(files));

    // 4. Extract server URLs for the header
    const serverUrls = (spec.servers || []).map((s: any) => s.url).join('\n');

    return {
      directoryStructure,
      files,
      instruction: `Virtual filesystem generated from ${title} OpenAPI spec.`,
      fileSummary: `Contains ${Object.keys(files).length} virtual endpoints and schemas.`,
      userProvidedHeader: serverUrls || undefined
    };
  }

  private generateTree(paths: string[]): string {
    const root: any = {};
    for (const path of paths) {
      const parts = path.split('/');
      let current = root;
      for (const part of parts) {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }

    let output = '';
    const render = (obj: any, depth: number) => {
      const keys = Object.keys(obj).sort();
      for (const key of keys) {
        const isDir = Object.keys(obj[key]).length > 0;
        output += '  '.repeat(depth) + key + (isDir ? '/' : '') + '\n';
        if (isDir) {
          render(obj[key], depth + 1);
        }
      }
    };
    render(root, 0);
    return output.trim();
  }
}

import { registry } from '../utils/command.js';

// Auto-register when the file is dynamically imported by src/index.ts
const pluginInstance = new OpenAPICommand();
registry.register(pluginInstance);

