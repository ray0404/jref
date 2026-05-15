import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServeCommand } from './serve.js';
import type { CLIOptions, CommandContext, ProjectSnapshot } from '../types/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import * as Y from 'yjs';

// Initialize global handler registry
(globalThis as any).registeredHandlers = {};

// Mock the MCP SDK Types
vi.mock('@modelcontextprotocol/sdk/types.js', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    ListToolsRequestSchema: { method: 'tools/list' },
    CallToolRequestSchema: { method: 'tools/call' },
    ListResourcesRequestSchema: { method: 'resources/list' },
    ReadResourceRequestSchema: { method: 'resources/read' },
    ListPromptsRequestSchema: { method: 'prompts/list' },
    GetPromptRequestSchema: { method: 'prompts/get' },
  };
});

// Mock the MCP Server
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    Server: vi.fn().mockImplementation((info, config) => {
      return {
        setRequestHandler: vi.fn().mockImplementation((schema, handler) => {
          (globalThis as any).registeredHandlers[schema.method] = handler;
        }),
        connect: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
      };
    }),
  };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({
      onclose: vi.fn(),
      close: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
    })),
  };
});

// Mock the command registry
vi.mock('../utils/command.js', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    registry: {
      getCommandNames: vi.fn().mockReturnValue(['inspect']),
      get: vi.fn().mockImplementation((name) => {
        if (name === 'inspect') {
          return {
            definition: {
              name: 'inspect',
              description: 'Inspect snapshot',
              options: [],
            },
            execute: vi.fn(),
          };
        }
        return undefined;
      }),
    },
  };
});

// Mock streaming-json
vi.mock('../utils/streaming-json.js', () => ({
  loadSnapshotFromFile: vi.fn(),
  calculateMetadata: vi.fn().mockReturnValue({}),
}));

const mockSnapshot: ProjectSnapshot = {
  directoryStructure: 'project/\n├── src/\n│   └── main.ts',
  files: {
    'src/main.ts': 'export function main() {}',
  },
  instruction: 'Test instruction',
  roadmap: 'Initial roadmap',
};

describe('ServeCommand MCP Expansion', () => {
  let command: ServeCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new ServeCommand();
    mockContext = {
      snapshot: mockSnapshot,
    };
    // Clear handlers between tests
    (globalThis as any).registeredHandlers = {};
  });

  it('should register ListResources handler', async () => {
    command.execute([], {}, mockContext);
    
    // Give it a tick to register handlers
    await new Promise(resolve => setTimeout(resolve, 50));

    const handlers = (globalThis as any).registeredHandlers;
    expect(handlers['resources/list']).toBeDefined();
    
    const resources = await handlers['resources/list']();
    expect(resources.resources).toContainEqual(expect.objectContaining({
      uri: 'jref://snapshot/files/src/main.ts',
    }));
  });

  it('should register ReadResource handler', async () => {
    command.execute([], {}, mockContext);
    await new Promise(resolve => setTimeout(resolve, 50));

    const handlers = (globalThis as any).registeredHandlers;
    expect(handlers['resources/read']).toBeDefined();
    
    const resource = await handlers['resources/read']({
      params: { uri: 'jref://snapshot/files/src/main.ts' }
    });
    expect(resource.contents[0].text).toBe('export function main() {}');
  });

  it('should register Prompts handlers', async () => {
    command.execute([], {}, mockContext);
    await new Promise(resolve => setTimeout(resolve, 50));

    const handlers = (globalThis as any).registeredHandlers;
    expect(handlers['prompts/list']).toBeDefined();
    expect(handlers['prompts/get']).toBeDefined();
    
    const prompts = await handlers['prompts/list']();
    expect(prompts.prompts.some((p: any) => p.name === 'ArchitecturalReview')).toBe(true);
  });

  it('should handle roadmap updates via CRDT', async () => {
    command.execute([], {}, mockContext);
    await new Promise(resolve => setTimeout(resolve, 50));

    const handlers = (globalThis as any).registeredHandlers;
    const callTool = handlers['tools/call'];
    expect(callTool).toBeDefined();
    
    await callTool({
      params: {
        name: 'update_roadmap_state',
        arguments: { delta: ' Update 1' }
      }
    });

    const inspectResult = await callTool({
      params: {
        name: 'inspect',
        arguments: {}
      }
    });
    
    const output = JSON.parse(inspectResult.content[0].text);
    expect(output.roadmap).toContain('Update 1');
  });
});
