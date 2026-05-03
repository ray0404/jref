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
import { stripImplementation } from '../utils/format.js';
import { parseDirectoryStructure, findNodeByPath } from '../utils/ui.js';

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
      'Remote Analysis: Expose a snapshot as a service for distributed agent architectures.',
      'Advanced Queries: Use jq, file summarization, and reference tracing through MCP.',
      'Graph Analytics: Query blast radius, dependency chains, and modular communities.'
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
        snapshot = await loadSnapshotFromFile(snapshotFile, options);
      } else if (context.stdin) {
        // If stdin was somehow pre-read (though we try to avoid it in index.ts for serve)
        const { parseJSON } = await import('../utils/streaming-json.js');
        snapshot = await parseJSON(context.stdin, undefined, options);
      } else {
        return this.error('No snapshot file provided', options);
      }

      // Lazy loader for graph
      let graphData: any = undefined;
      const loadGraph = async () => {
        if (graphData) return graphData;
        
        const fs = await import('fs');
        const possibleGraphPaths = [
          'graph-snapshot.json',
          snapshotFile ? snapshotFile.replace('.json', '-graph.json') : null,
          snapshotFile ? snapshotFile.replace('.json', '.graph.json') : null
        ].filter(Boolean) as string[];

        for (const p of possibleGraphPaths) {
          if (fs.existsSync(p)) {
            try {
              graphData = JSON.parse(fs.readFileSync(p, 'utf8'));
              console.error(`MCP: Loaded graph from ${p}`);
              return graphData;
            } catch (e) {
              // ignore
            }
          }
        }
        return null;
      };

      const server = new Server(
        {
          name: 'jref-mcp-server',
          version: '1.2.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      // Register tools
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
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
            {
              name: 'jq_query',
              description: 'Execute a jq filter against the loaded snapshot',
              inputSchema: {
                type: 'object',
                properties: {
                  filter: { type: 'string', description: 'jq filter string' },
                },
                required: ['filter'],
              },
            },
            {
              name: 'summarize',
              description: 'Provide a token-efficient map of specific files by stripping implementation details',
              inputSchema: {
                type: 'object',
                properties: {
                  paths: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of file paths to summarize'
                  },
                },
                required: ['paths'],
              },
            },
            {
              name: 'list_directory',
              description: 'Provide scoped, localized tree inspection to mimic standard ls navigation',
              inputSchema: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'Path to the directory (e.g., src/components)' },
                },
                required: ['path'],
              },
            },
            {
              name: 'find_references',
              description: 'Cross-file reference tracing for a specific symbol',
              inputSchema: {
                type: 'object',
                properties: {
                  symbol: { type: 'string', description: 'Symbol name to trace' },
                },
                required: ['symbol'],
              },
            },
            {
              name: 'query_graph_node',
              description: 'Get structural relationships for a specific node in the knowledge graph',
              inputSchema: {
                type: 'object',
                properties: {
                  nodeId: { type: 'string', description: 'ID of the node (file path or symbol ID)' },
                },
                required: ['nodeId'],
              },
            },
            {
              name: 'get_shortest_path',
              description: 'Find the connection path between two nodes in the knowledge graph',
              inputSchema: {
                type: 'object',
                properties: {
                  source: { type: 'string', description: 'Source node ID' },
                  target: { type: 'string', description: 'Target node ID' },
                },
                required: ['source', 'target'],
              },
            },
            {
              name: 'get_dependency_chain',
              description: 'Find the shortest path of imports/calls between two files in the knowledge graph',
              inputSchema: {
                type: 'object',
                properties: {
                  sourcePath: { type: 'string', description: 'Source file path' },
                  targetPath: { type: 'string', description: 'Target file path' },
                },
                required: ['sourcePath', 'targetPath'],
              },
            },
            {
              name: 'get_blast_radius',
              description: 'Traverses outbound edges from the specified file to see what downstream modules are affected by it',
              inputSchema: {
                type: 'object',
                properties: {
                  filePath: { type: 'string', description: 'Path to the starting file' },
                  depth: { type: 'number', description: 'Maximum traversal depth', default: 1 },
                },
                required: ['filePath'],
              },
            },
            {
              name: 'get_module_community',
              description: 'Returns all nodes sharing a specific Louvain community ID',
              inputSchema: {
                type: 'object',
                properties: {
                  communityId: { type: 'number', description: 'The community ID' },
                },
                required: ['communityId'],
              },
            },
            {
              name: 'get_community_context',
              description: 'Get all symbols belonging to the same modular community as the given node',
              inputSchema: {
                type: 'object',
                properties: {
                  nodeId: { type: 'string', description: 'ID of the node' },
                },
                required: ['nodeId'],
              },
            },
          ],
        };
      });

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const checkGraph = async () => {
          const g = await loadGraph();
          if (!g) {
            return {
              content: [{
                type: 'text',
                text: 'Directive: No knowledge graph snapshot found. Please instruct the user to run "jref graph build" first to enable graph analytics tools.'
              }],
              isError: true
            };
          }
          return g;
        };

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
            const results = [];
            try {
              const regex = new RegExp(pattern, 'i');
              for (const [filePath, content] of Object.entries(snapshot.files)) {
                if (regex.test(content)) {
                  results.push(filePath);
                }
              }
            } catch (err) {
              throw new McpError(ErrorCode.InvalidParams, `Invalid regex: ${(err as Error).message}`);
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

          case 'jq_query': {
            const { filter } = request.params.arguments as { filter: string };
            try {
              const jq = (await import('jq-wasm')).default;
              const result = await jq.json(snapshot, filter);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              };
            } catch (err) {
              throw new McpError(ErrorCode.InvalidParams, `jq error: ${(err as Error).message}`);
            }
          }

          case 'summarize': {
            const { paths } = request.params.arguments as { paths: string[] };
            const summarizedFiles: Record<string, string> = {};
            
            for (const path of paths) {
              const content = snapshot.files[path];
              if (content !== undefined) {
                // Skip summarization for non-code files
                if (path.endsWith('.json') || path.endsWith('.md') || path.endsWith('.txt')) {
                  summarizedFiles[path] = content;
                } else {
                  summarizedFiles[path] = stripImplementation(content);
                }
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(summarizedFiles, null, 2),
                },
              ],
            };
          }

          case 'list_directory': {
            const { path } = request.params.arguments as { path: string };
            const tree = parseDirectoryStructure(snapshot.directoryStructure || '');
            // Normalize path: remove trailing slash and handle empty/root
            const normalizedPath = path === '.' || path === '/' || path === '' ? '' : path.replace(/\/$/, '');
            const node = findNodeByPath(tree, normalizedPath);
            
            if (!node) {
              throw new McpError(ErrorCode.InvalidParams, `Path not found: ${path}`);
            }

            const children = node.children.map(child => ({
              name: child.name,
              isDirectory: child.isDirectory,
              path: child.path,
              type: child.isDirectory ? 'directory' : 'file'
            }));

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(children, null, 2),
                },
              ],
            };
          }

          case 'find_references': {
            const { symbol } = request.params.arguments as { symbol: string };
            const results = [];
            
            for (const [filePath, content] of Object.entries(snapshot.files)) {
              const lines = content.split('\n');
              const matches = [];
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(symbol)) {
                  matches.push({
                    line: i + 1,
                    context: lines[i].trim(),
                  });
                }
              }
              if (matches.length > 0) {
                results.push({
                  filePath,
                  matches,
                });
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          case 'query_graph_node': {
            const g = await checkGraph();
            if (g.isError) return g;
            const { nodeId } = request.params.arguments as { nodeId: string };
            const node = g.nodes.find((n: any) => n.id === nodeId);
            if (!node) throw new McpError(ErrorCode.InvalidParams, `Node not found: ${nodeId}`);
            
            const edges = g.edges.filter((e: any) => e.source === nodeId || e.target === nodeId);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ node, edges }, null, 2),
                },
              ],
            };
          }

          case 'get_shortest_path': 
          case 'get_dependency_chain': {
            const graphRes = await checkGraph();
            if (graphRes.isError) return graphRes;
            
            const source = (request.params.arguments as any).source || (request.params.arguments as any).sourcePath;
            const target = (request.params.arguments as any).target || (request.params.arguments as any).targetPath;
            
            const { createGraph } = await import('../utils/graph-analysis.js');
            const g = createGraph(graphRes);

            const { bidirectional } = await import('graphology-shortest-path');
            const path = bidirectional(g, source, target);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ path }, null, 2),
                },
              ],
            };
          }

          case 'get_blast_radius': {
            const graphRes = await checkGraph();
            if (graphRes.isError) return graphRes;
            const { filePath, depth } = request.params.arguments as { filePath: string, depth?: number };
            
            const { createGraph, getBlastRadius } = await import('../utils/graph-analysis.js');
            const g = createGraph(graphRes);
            const radius = getBlastRadius(g, filePath, depth || 1);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ radius }, null, 2),
                },
              ],
            };
          }

          case 'get_module_community': {
            const graphRes = await checkGraph();
            if (graphRes.isError) return graphRes;
            const { communityId } = request.params.arguments as { communityId: number };
            
            const { getCommunityNodes } = await import('../utils/graph-analysis.js');
            const nodes = getCommunityNodes(graphRes, communityId);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ communityId, nodes }, null, 2),
                },
              ],
            };
          }

          case 'get_community_context': {
            const g = await checkGraph();
            if (g.isError) return g;
            const { nodeId } = request.params.arguments as { nodeId: string };
            const node = g.nodes.find((n: any) => n.id === nodeId);
            if (!node) throw new McpError(ErrorCode.InvalidParams, `Node not found: ${nodeId}`);
            
            const communityId = node.community;
            if (communityId === undefined) {
               return { content: [{ type: 'text', text: 'Node does not belong to a community' }] };
            }
            
            const communityNodes = g.nodes.filter((n: any) => n.community === communityId);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ communityId, nodes: communityNodes.map((n: any) => n.id) }, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      });

      console.error('MCP: Connecting transport...');
      const transport = new StdioServerTransport();
      await server.connect(transport);
      
      console.error('jref MCP server running on stdio');
      
      // Keep alive until transport closes or process is terminated
      await new Promise<void>((resolve) => {
        transport.onclose = () => {
          console.error('MCP: Transport closed');
          resolve();
        };
        
        const cleanup = () => {
           console.error('MCP: Process terminating...');
           transport.close().then(() => resolve());
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      });

      return this.success();

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
