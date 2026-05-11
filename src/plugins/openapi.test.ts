/**
 * OpenAPI Plugin Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import OpenAPICommand from './openapi.js';
import type { CLIOptions, CommandContext } from '../types/index.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

const mockJsonSpec = {
  openapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {
    '/test': {
      get: {
        summary: 'Test endpoint',
        responses: { '200': { description: 'OK' } }
      }
    }
  }
};

const mockYamlSpec = `
openapi: 3.0.0
info:
  title: Test YAML API
  version: 1.0.0
paths:
  /test:
    get:
      summary: Test YAML endpoint
      responses:
        '200':
          description: OK
`;

describe('OpenAPICommand', () => {
  let command: OpenAPICommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new OpenAPICommand();
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('openapi');
    expect(command.definition.description).toBeTruthy();
  });

  it('should execute successfully with valid JSON input from stdin', async () => {
    mockContext = {
      stdin: JSON.stringify(mockJsonSpec),
      stdinIsPipe: true
    };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await command.execute([], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    const snapshot = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(snapshot.files['paths/test/GET.json']).toBeTruthy();
    expect(snapshot.instruction).toContain('Test API');
    consoleSpy.mockRestore();
  });

  it('should execute successfully with valid YAML input from stdin', async () => {
    mockContext = {
      stdin: mockYamlSpec,
      stdinIsPipe: true
    };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await command.execute([], { json: true }, mockContext);

    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    const snapshot = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(snapshot.files['paths/test/GET.json']).toBeTruthy();
    expect(snapshot.instruction).toContain('Test YAML API');
    consoleSpy.mockRestore();
  });

  it('should execute successfully with a YAML file', async () => {
    const tempFilePath = resolve(process.cwd(), 'temp-test-spec.yaml');
    writeFileSync(tempFilePath, mockYamlSpec);

    try {
      mockContext = { stdin: '', stdinIsPipe: false };
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const result = await command.execute(['temp-test-spec.yaml'], { json: true }, mockContext);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      const snapshot = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(snapshot.files['paths/test/GET.json']).toBeTruthy();
      consoleSpy.mockRestore();
    } finally {
      if (existsSync(tempFilePath)) unlinkSync(tempFilePath);
    }
  });

  it('should handle invalid spec content', async () => {
    // Provide something that is valid YAML (a string) but not a valid OpenAPI object
    mockContext = {
      stdin: 'just a string',
      stdinIsPipe: true
    };
    const result = await command.execute([], {}, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('OpenAPI parsing failed');
  });

  it('should return error for missing input', async () => {
    mockContext = { stdin: '', stdinIsPipe: false };
    const result = await command.execute([], {}, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Requires an OpenAPI JSON/YAML');
  });
});
