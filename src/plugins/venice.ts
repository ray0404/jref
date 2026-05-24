import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext } from '../types/index.js';
import { render } from 'ink';
import React from 'react';
import { APIWrapperUI } from '../components/APIWrapperUI.js';
import { reestablishTTY } from '../utils/input.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseEndpoints } from '../utils/api-schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class VeniceCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'venice',
    description: 'Interactive wrapper for the VeniceAI API',
    usage: 'jref venice [action] [options]',
    options: [
      {
        flags: '--ui, -u',
        description: 'Open interactive Venice AI dashboard'
      },
      {
        flags: '--prompt, -p',
        description: 'Prompt for chat completions'
      }
    ],
    examples: [
      'jref venice --ui',
      'jref venice models',
      'jref venice chat --prompt "Hello"'
    ],
    workflows: [
      'Interactive API Testing: Use --ui to interactively explore and test Venice AI capabilities.',
      'Headless Automation: Use standard CLI commands to integrate AI calls directly into scripts.'
    ]
  };

  private loadSchema(): any {
    let schemaPath = resolve(__dirname, '../../schemas/api/venice/venice-api.json');
    if (!existsSync(schemaPath)) {
      schemaPath = resolve(process.cwd(), 'schemas/api/venice/venice-api.json');
    }
    if (!existsSync(schemaPath)) return null;
    try {
      return JSON.parse(readFileSync(schemaPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  async execute(
    args: string[],
    options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return this.error('VENICE_API_KEY environment variable is missing.', options);
    }

    const action = args[0];
    const promptOption = (options as any).prompt as string | undefined;

    const schema = this.loadSchema();
    const endpoints = parseEndpoints(schema);

    if (options.ui || (!action && process.stdout.isTTY)) {
      return new Promise((resolve) => {
        reestablishTTY();
        const { unmount } = render(
          React.createElement(APIWrapperUI, {
            endpoints,
            branding: {
              title: 'Venice AI',
              primaryColor: 'magenta',
              borderColor: 'magenta'
            },
            onAction: async (act, payload) => {
              return await this.performAction(apiKey, act, payload);
            },
            onExit: () => {
              unmount();
              resolve(this.success());
            }
          })
        );
      });
    }

    if (!action) {
      return this.error('No action provided. Provide "models", "chat", or use --ui.', options);
    }

    let result;
    if (action === 'models') {
       result = await this.performAction(apiKey, 'GET /models', {});
    } else if (action === 'chat') {
       result = await this.performAction(apiKey, 'POST /chat/completions', {
         body: {
           model: 'llama-3.3-70b',
           messages: [{ role: 'user', content: promptOption || 'Hello' }]
         }
       });
    } else {
       const endpoint = endpoints.find(e => e.id === action);
       if (endpoint) {
         result = await this.performAction(apiKey, endpoint.id, promptOption ? { body: JSON.parse(promptOption) } : {});
       } else {
         return this.error(`Unknown action or endpoint: ${action}`, options);
       }
    }
    
    if (result.success) {
      this.print(result.data, options);
    } else {
      this.error(result.error || 'Unknown error', options);
    }

    return result;
  }

  private async performAction(apiKey: string, endpointId: string, payload?: { query?: Record<string,any>, body?: any }): Promise<CommandResult> {
    const baseUrl = 'https://api.venice.ai/api/v1';
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
      
      const reqInit: RequestInit = {
        method,
        headers: { 'Authorization': `Bearer ${apiKey}` }
      };
      
      if (payload?.body && Object.keys(payload.body).length > 0 && method !== 'GET' && method !== 'HEAD') {
        (reqInit.headers as any)['Content-Type'] = 'application/json';
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
    return { action: args[0] };
  }
}

import { registry } from '../utils/command.js';
const pluginInstance = new VeniceCommand();
registry.register(pluginInstance);
