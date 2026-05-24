import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { render } from 'ink';
import React from 'react';
import { APIWrapperUI } from '../components/APIWrapperUI.js';
import { reestablishTTY } from '../utils/input.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseEndpoints } from '../utils/api-schema.js';
import { parse as parseYaml } from 'yaml';

export default class APICommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'api',
    description: 'Universal interactive wrapper for any OpenAPI/Swagger API',
    usage: 'jref api <schema.json|yaml> [options]',
    options: [
      {
        flags: '--env, -e',
        description: 'Environment variable name for the API Key (default: API_KEY)',
        defaultValue: 'API_KEY'
      },
      {
        flags: '--base-url, -b',
        description: 'Override the base URL for the API'
      }
    ],
    examples: [
      'jref api schemas/api/venice/venice-api.json --env VENICE_API_KEY',
      'jref api https://api.example.com/openapi.json --env MY_TOKEN'
    ],
    workflows: [
      'Rapid Prototyping: Instantly generate a full interactive TUI for any new API by just providing its schema.',
      'Data Pipelines: Interactively test endpoints and pipe results to local files or commands.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    const schemaPath = args[0];
    if (!schemaPath) {
      return this.error('Requires a path or URL to an OpenAPI JSON/YAML schema.', options);
    }

    const envVar = (options as any).env || 'API_KEY';
    const apiKey = process.env[envVar];

    let schema: any;
    try {
      const content = readFileSync(resolve(process.cwd(), schemaPath), 'utf-8');
      schema = schemaPath.endsWith('.yaml') || schemaPath.endsWith('.yml') ? parseYaml(content) : JSON.parse(content);
    } catch (err: any) {
      return this.error(`Failed to load schema: ${err.message}`, options);
    }

    const endpoints = parseEndpoints(schema);
    const baseUrl = (options as any).baseUrl || schema.servers?.[0]?.url;

    if (!baseUrl) {
       return this.error('No base URL found in schema and none provided via --base-url.', options);
    }

    return new Promise((resolve) => {
      reestablishTTY();
      const { unmount } = render(
        React.createElement(APIWrapperUI, {
          endpoints,
          branding: {
            title: schema.info?.title || 'Universal API',
            primaryColor: 'cyan',
            borderColor: 'cyan'
          },
          onAction: async (endpointId, payload) => {
             return await this.performAction(apiKey || '', baseUrl, endpointId, payload);
          },
          onExit: () => {
            unmount();
            resolve(this.success());
          }
        })
      );
    });
  }

  private async performAction(apiKey: string, baseUrl: string, endpointId: string, payload?: { query?: Record<string,any>, body?: any }): Promise<CommandResult> {
    try {
      const parts = endpointId.split(' ');
      const method = parts[0];
      let path = parts[1];
      
      if (payload?.query) {
        for (const [k, v] of Object.entries(payload.query)) {
          if (path.includes(`{${k}}`)) {
            path = path.replace(`{${k}}`, encodeURIComponent(String(v)));
            delete payload.query[k];
          }
        }
      }
      
      const qParams = new URLSearchParams();
      if (payload?.query) {
        for (const [k, v] of Object.entries(payload.query)) {
          if (v !== undefined && v !== '') {
            qParams.append(k, String(v));
          }
        }
      }
      const qString = qParams.toString();
      const url = `${baseUrl}${path}${qString ? '?' + qString : ''}`;
      
      const headers: any = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const reqInit: RequestInit = {
        method,
        headers
      };
      
      if (payload?.body && Object.keys(payload.body).length > 0 && method !== 'GET' && method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
        reqInit.body = JSON.stringify(payload.body);
      }
      
      const response = await fetch(url, reqInit);
      if (!response.ok) {
        let errStr = response.statusText;
        try {
           const errBody: any = await response.json();
           if (errBody.error) errStr = typeof errBody.error === 'string' ? errBody.error : JSON.stringify(errBody.error);
        } catch {}
        return { success: false, exitCode: 1, error: `API Error ${response.status}: ${errStr}` };
      }
      const data = await response.json();
      return this.success(undefined, data);
    } catch (err: any) {
      return { success: false, exitCode: 1, error: `Request failed: ${err.message}` };
    }
  }

  protected parseArgs(args: string[]): Record<string, unknown> {
    return { schemaPath: args[0] };
  }
}

import { registry } from '../utils/command.js';
const pluginInstance = new APICommand();
registry.register(pluginInstance);
