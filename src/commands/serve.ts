import { Command, registry } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { loadSnapshotFromFile, calculateMetadata } from '../utils/streaming-json.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { setOutputHandler } from '../utils/output.js';

export class ServeCommand extends Command {
  readonly definition = {
    name: 'serve',
    description: 'Start an MCP server to expose jref capabilities to AI agents',
    usage: 'jref serve [snapshot.json]',
    options: [
      {
        flags: '--port <number>',
        description: 'Port for the MCP server (if using network transport - TBD)'
      }
    ],
    examples: [
      'jref serve snapshot.json',
      'jref serve'
    ],
    workflows: [
      'Agent Context: Provide AI agents with structured access to the codebase via MCP.',
      'Live Tooling: Agents can dynamically call pack, search, and graph tools.',
      'Context Loading: Start a session and let the agent load snapshots as needed.',
      'Enriched Inspect: Get high-level instructions and roadmaps directly in the session.'
    ]
  };

  private snapshot: ProjectSnapshot | null = null;
  private snapshotFile: string | null = null;

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
      } else if (this.snapshotFile) {
        this.snapshot = await loadSnapshotFromFile(this.snapshotFile, options);
      }

      const server = new Server(
        {
          name: 'jref-mcp-server',
          version: '1.3.0',
        },
        {
          capabilities: {
            tools: {},
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
          description: 'Load a project snapshot from a file path',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the .json snapshot file' },
            },
            required: ['path'],
          },
        });

        // Override some tools for better schema if needed, but dynamic mapping handles most
        return { tools };
      });

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArgs } = request.params;

        // Handle specific MCP-only tools
        if (name === 'load_snapshot') {
          const { path } = toolArgs as { path: string };
          try {
            this.snapshot = await loadSnapshotFromFile(path, options);
            this.snapshotFile = path;
            return {
              content: [{ type: 'text', text: `Successfully loaded snapshot from ${path}` }]
            };
          } catch (err) {
            throw new McpError(ErrorCode.InternalError, `Failed to load snapshot: ${(err as Error).message}`);
          }
        }

        // 3. Handle Dynamic Commands
        const command = registry.get(name);
        if (command) {
          if (!this.snapshot && !['pack', 'config', 'alias', 'bin-setup', 'get', 'set'].includes(name)) {
            return {
              content: [{ type: 'text', text: 'Directive: No snapshot loaded. Use "load_snapshot" or "pack" to establish context.' }],
              isError: true
            };
          }

          // Special case for 'inspect' to include roadmap and instruction
          if (name === 'inspect' && this.snapshot) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    metadata: calculateMetadata(this.snapshot),
                    directoryStructure: this.snapshot.directoryStructure,
                    instruction: this.snapshot.instruction,
                    roadmap: this.snapshot.roadmap,
                  }, null, 2),
                },
              ],
            };
          }

          // Build CLI-style arguments from toolArgs
          const cliArgs: string[] = [];
          
          if (toolArgs) {
            // Add positional arguments first
            if (Array.isArray(toolArgs.args)) {
              cliArgs.push(...toolArgs.args);
            }

            // Map named parameters back to flags
            for (const [key, value] of Object.entries(toolArgs)) {
              if (key === 'args') continue;

              // Convert camelCase back to kebab-case for flag
              const flag = '--' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
              
              if (typeof value === 'boolean') {
                if (value) cliArgs.push(flag);
              } else if (value !== undefined && value !== null) {
                cliArgs.push(flag, String(value));
              }
            }
          }
          
          const cliOptions: CLIOptions = { ...options, json: true };
          
          // Execute and capture output
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

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      });

      console.error('MCP: Connecting transport...');
      const transport = new StdioServerTransport();
      await server.connect(transport);
      
      console.error('jref MCP server running on stdio');
      
      await new Promise<void>((resolve) => {
        transport.onclose = () => resolve();
        process.on('SIGINT', () => transport.close().then(resolve));
        process.on('SIGTERM', () => transport.close().then(resolve));
      });

      return this.success();

    } catch (err) {
      return this.error(`Serve failed: ${(err as Error).message}`, options);
    }
  }

  private commandToTool(cmd: Command) {
    const { name, description, options } = cmd.definition;
    
    const properties: any = {
      args: {
        type: 'array',
        items: { type: 'string' },
        description: 'Positional arguments for the command'
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
      description,
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
