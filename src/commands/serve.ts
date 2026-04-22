
import { Command, type CommandDefinition } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, ProjectSnapshot } from '../types/index.js';
import { loadSnapshotFromFile } from '../utils/streaming-json.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

export class ServeCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'serve',
    description: 'Start an MCP server to expose snapshot to AI agents',
    usage: 'jref serve snapshot.json',
    options: [],
    examples: [
      'jref serve snapshot.json'
    ],
    workflows: [
      'Agent Context: Provide AI agents with structured access to the codebase via MCP.',
      'Live Tooling: Use search and query tools within your agentic workflow.',
      'Remote Analysis: Expose a snapshot as a service for distributed agent architectures.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      const { snapshotFile } = this.parseArgs(args);
      
      let snapshot: ProjectSnapshot;
      if (context.snapshot) {
        snapshot = context.snapshot;
      } else if (snapshotFile) {
        snapshot = await loadSnapshotFromFile(snapshotFile);
      } else {
        return this.error('No snapshot file provided', options);
      }

      const server = new Server(
        {
          name: 'jref-mcp-server',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      // Register tools
      server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
          {
            name: 'inspect',
            description: 'Get snapshot metadata and directory structure',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search',
            description: 'Search for a regex pattern in the snapshot',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: { type: 'string', description: 'Regex pattern to search for' },
              },
              required: ['pattern'],
            },
          },
          {
            name: 'query',
            description: 'Read the content of a specific file path',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'Path to the file' },
              },
              required: ['path'],
            },
          },
        ],
      }));

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        switch (request.params.name) {
          case 'inspect': {
            const { calculateMetadata } = await import('../utils/streaming-json.js');
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    metadata: calculateMetadata(snapshot),
                    directoryStructure: snapshot.directoryStructure,
                  }, null, 2),
                },
              ],
            };
          }

          case 'search': {
            const { pattern } = request.params.arguments as { pattern: string };
            
            // Re-use logic or implement a helper
            const results = [];
            const regex = new RegExp(pattern, 'i');
            for (const [filePath, content] of Object.entries(snapshot.files)) {
              if (regex.test(content)) {
                results.push(filePath);
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ results }, null, 2),
                },
              ],
            };
          }

          case 'query': {
            const { path } = request.params.arguments as { path: string };
            const content = snapshot.files[path];
            if (content === undefined) {
              throw new McpError(ErrorCode.InvalidParams, `File not found: ${path}`);
            }
            return {
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      });

      const transport = new StdioServerTransport();
      await server.connect(transport);
      
      // In stdio transport, we don't want to log anything else to stdout
      return this.success('MCP server running');

    } catch (err) {
      return this.error(`Serve failed: ${(err as Error).message}`, options);
    }
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
