import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VeniceCommand from './venice.js';
import type { CLIOptions, CommandContext } from '../types/index.js';

// Mock global fetch
const originalFetch = global.fetch;

describe('VeniceCommand', () => {
  let command: VeniceCommand;
  let mockContext: CommandContext;
  let mockOptions: CLIOptions;

  beforeEach(() => {
    command = new VeniceCommand();
    mockContext = {
      cwd: process.cwd()
    };
    mockOptions = {};
    
    // Clear env for predictable testing
    delete process.env.VENICE_API_KEY;

    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should have the correct command definition', () => {
    expect(command.definition.name).toBe('venice');
    expect(command.definition.description).toContain('VeniceAI');
  });

  it('should error if no API key is provided for non-interactive mode', async () => {
    const result = await command.execute(['models'], mockOptions, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('VENICE_API_KEY');
  });

  it('should call fetch to list models when API key is provided', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: 'model-1' }] })
    });

    const result = await command.execute(['models'], mockOptions, mockContext);
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.venice.ai/api/v1/models', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-key' }
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: [{ id: 'model-1' }] });
  });

  it('should call fetch for chat completion when chat action is provided', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    mockOptions.prompt = 'Hello world';
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hi there' } }] })
    });

    const result = await command.execute(['chat'], mockOptions, mockContext);
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.venice.ai/api/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-key' })
    }));
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ choices: [{ message: { content: 'Hi there' } }] });
  });
});
