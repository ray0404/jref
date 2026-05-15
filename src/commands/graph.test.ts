import { describe, it, expect, vi } from 'vitest';
import { GraphCommand } from './graph.js';
import * as fs from 'fs';
import { CommandContext } from '../types/index.js';

vi.mock('fs');
vi.mock('http');
vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn(),
  env: {
    cacheDir: ''
  }
}));

describe('GraphCommand', () => {
  const context: CommandContext = {
    stdin: '',
    stdinIsPipe: false
  };

  it('should parse ui subcommand and port flag', () => {
    const command = new GraphCommand();
    const args = ['ui', '--port', '9090'];
    const { subcommand, flags } = (command as any).parseArgs(args);
    
    expect(subcommand).toBe('ui');
    expect(flags.port).toBe('9090');
  });

  it('should parse build subcommand and target', () => {
    const command = new GraphCommand();
    const args = ['build', 'src'];
    const { subcommand, target } = (command as any).parseArgs(args);
    
    expect(subcommand).toBe('build');
    expect(target).toBe('src');
  });

  it('should error on invalid subcommand', async () => {
    const command = new GraphCommand();
    const options = {};
    const result = await command.execute(['invalid'], options, context);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid subcommand');
  });

  it('should parse build subcommand with format flag', () => {
    const command = new GraphCommand();
    const args = ['build', '.', '--format', 'gml'];
    const { subcommand, flags } = (command as any).parseArgs(args);
    
    expect(subcommand).toBe('build');
    expect(flags.format).toBe('gml');
  });

  it('should parse query subcommand', () => {
    const command = new GraphCommand();
    const args = ['query', 'MATCH (n)-[r:imports]->(m:ID) RETURN n'];
    const { subcommand, target } = (command as any).parseArgs(args);
    
    expect(subcommand).toBe('query');
    expect(target).toBe('MATCH (n)-[r:imports]->(m:ID) RETURN n');
  });
});
