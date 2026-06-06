import { Command, registry } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { loadSnapshotFromFile, calculateMetadata } from '../utils/streaming-json.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { setOutputHandler } from '../utils/output.js';
import * as Y from 'yjs';
import { PackCommand } from './pack.js';
import { isExplicitRemoteUrl, isValidShorthand } from 'repomix';

export class ServeCommand extends Command {
  readonly definition = {
    name: 'serve',
    description: 'Start an MCP server to expose jref capabilities to AI agents',
    usage: 'jref serve [snapshot.json|remote_url]',
    options: [
      {
        flags: '--port <number>',
        description: 'Port for the MCP server (if using network transport - TBD)'
      }
    ],
    examples: [
      'jref serve snapshot.json',
      'jref serve',
      'jref serve https://github.com/user/repo'
    ],
    workflows: [
      'Agent Context: Provide AI agents with structured access to the codebase via MCP.',
      'Live Tooling: Agents can dynamically call pack, search, and graph tools.',
      'Context Loading: Start a session and let the agent load snapshots as needed.',
      'Enriched Inspect: Get high-level instructions and roadmaps directly in the session.',
      'Remote Context: Serve a remote GitHub/GitLab repository directly to the agent.'
    ]
  };

  private snapshot: ProjectSnapshot | null = null;
  private snapshotFile: string | null = null;
  private yDoc: Y.Doc = new Y.Doc();
  private yRoadmap: Y.Text = this.yDoc.getText('roadmap');

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotFile: fileArg } = this.parseArgs(args);
      this.snapshotFile = fileArg || null;

      if (context.snapshot) {
        this.snapshot = context.snapshot;
        this.initializeCRDT();
      } else if (this.snapshotFile) {
        await this.loadOrPackSnapshot(this.snapshotFile, options, context);
      }

      const server = new Server(
        {
          name: 'jref-mcp-server',
          version: '1.4.0',
        },
        {
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
        }
      );

      // Register tools
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools = [];

        // 1. Dynamic Tool Mapping from Registry
        const allCommands = registry.getCommandNames();
        for (const cmdName of allCommands) {
          // Skip 'serve' itself to avoid confusion
          if (cmdName === 'serve') continue;

          const cmd = registry.get(cmdName)!;
          tools.push(this.commandToTool(cmd));
        }

        // 2. Add specific MCP-only tools
        tools.push({
          name: 'load_snapshot',
          description: 'Load a project snapshot from a file path or pack a remote repository URL',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the .json snapshot file or a remote repository URL' },
            },
            required: ['path'],
          },
        });

        tools.push({
          name: 'update_roadmap_state',
          description: 'Apply a delta update to the project roadmap state (CRDT-based)',
          inputSchema: {
            type: 'object',
            properties: {
              delta: { type: 'string', description: 'Text to append to the roadmap' },
            },
            required: ['delta'],
          },
        });

        // Override some tools for better schema if needed, but dynamic mapping handles most
        return { tools };
      });

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArgs } = request.params;

        if (name === 'load_snapshot') {
          const { path } = toolArgs as { path: string };
          const result = await this.handleLoadSnapshot(path, options, context);
          return result;
        }

        if (name === 'update_roadmap_state') {
          const { delta } = toolArgs as { delta: string };
          this.yRoadmap.insert(this.yRoadmap.length, delta);
          if (this.snapshot) {
            this.snapshot.roadmap = this.yRoadmap.toString();
          }
          return {
            content: [{ type: 'text', text: 'Roadmap state updated successfully.' }]
          };
        }

        const command = registry.get(name);
        if (command) {
          return await this.handleDynamicCommand(name, toolArgs, command, options, context);
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      });

      // 3. Resources Integration
      server.setRequestHandler(ListResourcesRequestSchema, async () => {
        if (!this.snapshot) return { resources: [] };

        const resources = Object.keys(this.snapshot.files).map((path) => ({
          uri: `jref://snapshot/files/${path}`,
          name: path,
          mimeType: 'text/plain', // Default to plain text
          description: `Source file: ${path}`,
        }));

        return { resources };
      });

      server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        if (!this.snapshot) throw new McpError(ErrorCode.InvalidRequest, 'No snapshot loaded');

        const prefix = 'jref://snapshot/files/';
        if (!uri.startsWith(prefix)) {
          throw new McpError(ErrorCode.InvalidRequest, `Unsupported URI scheme: ${uri}`);
        }

        const path = uri.slice(prefix.length);
        const content = this.snapshot.files[path];

        if (content === undefined) {
          throw new McpError(ErrorCode.InvalidRequest, `File not found in snapshot: ${path}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: content,
            },
          ],
        };
      });

      // 4. Prompts Integration
      server.setRequestHandler(ListPromptsRequestSchema, async () => {
        if (!this.snapshot) return { prompts: [] };

        return {
          prompts: [
            {
              name: 'RunBlastRadiusValidation',
              description: 'Template for validating the blast radius of a proposed change against project instructions.',
            },
            {
              name: 'ArchitecturalReview',
              description: 'Complete architectural review of the codebase using snapshot summaries.',
            },
          ],
        };
      });

      server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name } = request.params;
        if (!this.snapshot) throw new McpError(ErrorCode.InvalidRequest, 'No snapshot loaded');

        if (name === 'RunBlastRadiusValidation') {
          return {
            description: 'Blast Radius Validation Prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Analyze the following proposed change for potential side effects and violations of project rules.\n\nProject Instructions:\n${this.snapshot.instruction}\n\nProposed Change:\n{{diff}}`,
                },
              },
            ],
          };
        }

        if (name === 'ArchitecturalReview') {
          // In a real scenario, we might call 'summarize' here
          // For now, we'll provide a generic template that asks the agent to use the available tools
          return {
            description: 'Architectural Review Prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'Perform a comprehensive architectural review of this project. Use the "summarize" and "graph" tools to map out dependencies and key God Nodes.',
                },
              },
            ],
          };
        }

        throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      });

      console.error('MCP: Connecting transport...');
      const transport = new StdioServerTransport();
      await server.connect(transport);

      console.error('jref MCP server running on stdio');

      await new Promise<void>((resolve) => {
        transport.onclose = () => resolve();
        const close = () => {
          const p = transport.close();
          if (p && typeof p.then === 'function') {
            p.then(resolve).catch(() => resolve());
          } else {
            resolve();
          }
        };
        process.on('SIGINT', close);
        process.on('SIGTERM', close);
      });

      return this.success();

    } catch (err) {
      return this.error(`Serve failed: ${(err as Error).message}`, options);
    }
  }

  private initializeCRDT() {
    if (this.snapshot && this.snapshot.roadmap) {
      this.yRoadmap.delete(0, this.yRoadmap.length);
      this.yRoadmap.insert(0, this.snapshot.roadmap);
    }
  }

  private async loadOrPackSnapshot(target: string, options: CLIOptions, context: CommandContext): Promise<void> {
    const isRemote = isExplicitRemoteUrl(target) || isValidShorthand(target);

    if (isRemote) {
      if (!options.silent) {
        console.error(`🔄 Detected remote URL. Packing ${target} in memory...`);
      }
      const packCmd = new PackCommand();
      const packResult = await packCmd.execute([target], { ...options, json: true, silent: true }, context);

      if (packResult.success && packResult.data) {
        this.snapshot = packResult.data as ProjectSnapshot;
        this.initializeCRDT();
      } else {
        throw new Error(`Failed to pack remote repository: ${packResult.error || 'Unknown error'}`);
      }
    } else {
      this.snapshot = await loadSnapshotFromFile(target, options);
      this.initializeCRDT();
    }
  }

  private async handleLoadSnapshot(path: string, options: CLIOptions, context: CommandContext) {
    try {
      await this.loadOrPackSnapshot(path, options, context);
      this.snapshotFile = path;
      return {
        content: [{ type: 'text', text: `Successfully loaded snapshot context from ${path}` }]
      };
    } catch (err) {
      throw new McpError(ErrorCode.InternalError, `Failed to load snapshot context: ${(err as Error).message}`);
    }
  }

  private async handleDynamicCommand(
    name: string,
    toolArgs: any,
    command: Command,
    options: CLIOptions,
    context: CommandContext
  ) {
    if (!this.snapshot && !['pack', 'config', 'alias', 'bin-setup', 'get', 'set'].includes(name)) {
      return {
        content: [{ type: 'text', text: 'Directive: No snapshot loaded. Use "load_snapshot" or "pack" to establish context.' }],
        isError: true
      };
    }

    if (name === 'inspect' && this.snapshot) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              metadata: calculateMetadata(this.snapshot),
              directoryStructure: this.snapshot.directoryStructure,
              instruction: this.snapshot.instruction,
              roadmap: this.yRoadmap.toString(),
            }, null, 2),
          },
        ],
      };
    }

    const cliArgs: string[] = [];

    if (toolArgs) {
      if (Array.isArray(toolArgs.args)) {
        cliArgs.push(...toolArgs.args);
      }

      for (const [key, value] of Object.entries(toolArgs)) {
        if (key === 'args') continue;

        const flag = '--' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

        if (typeof value === 'boolean') {
          if (value) cliArgs.push(flag);
        } else if (value !== undefined && value !== null) {
          cliArgs.push(flag, String(value));
        }
      }
    }

    const cliOptions: CLIOptions = { ...options, json: true };

    let stdout = '';
    let stderr = '';

    setOutputHandler((data, type) => {
      if (type === 'stdout') stdout += data + '\n';
      else stderr += data + '\n';
    });

    try {
      const result = await command.execute(cliArgs, cliOptions, {
        ...context,
        snapshot: this.snapshot || undefined
      });

      return {
        content: [
          { type: 'text', text: stdout || (result.success ? 'Success' : 'No output') },
          ...(stderr ? [{ type: 'text', text: `Error Output: ${stderr}` }] : [])
        ],
        isError: !result.success
      };
    } finally {
      setOutputHandler(null);
    }
  }

  private commandToTool(cmd: Command) {
    const { name, description, usage, options, examples } = cmd.definition;

    let enhancedDescription = description;
    if (usage) enhancedDescription += `\n\nUsage: ${usage}`;
    if (examples && examples.length > 0) enhancedDescription += `\n\nExamples:\n- ${examples.join('\n- ')}`;

    const properties: any = {
      args: {
        type: 'array',
        items: { type: 'string' },
        description: 'Positional arguments for the command. Subcommands (e.g., set, list) MUST be the first items in this array.'
      }
    };

    // Map options to named properties
    for (const opt of options) {
      const match = opt.flags.match(/--([a-zA-Z0-9-]+)/);
      if (match) {
        const flagName = match[1];
        const paramName = flagName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        const isString = opt.flags.includes('<') || opt.flags.includes('[');

        properties[paramName] = {
          type: isString ? 'string' : 'boolean',
          description: opt.description
        };
      }
    }

    return {
      name,
      description: enhancedDescription,
      inputSchema: {
        type: 'object',
        properties,
      }
    };
  }

  protected parseArgs(args: string[]): { snapshotFile?: string } {
    let snapshotFile: string | undefined;

    for (const arg of args) {
      if (!arg.startsWith('-')) {
        snapshotFile = arg;
        break;
      }
    }

    return { snapshotFile };
  }
}
