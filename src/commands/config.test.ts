import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigCommand } from './config.js';
import type { CLIOptions, CommandContext } from '../types/index.js';
import fs from 'fs';
import os from 'os';

vi.mock('fs');
vi.mock('os');

describe('ConfigCommand', () => {
  let command: ConfigCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new ConfigCommand();
    mockContext = {
      stdin: '',
      stdinIsPipe: false
    };
    vi.clearAllMocks();
    
    // Default mocks
    (os.homedir as any).mockReturnValue('/home/user');
    (fs.existsSync as any).mockReturnValue(false);
  });

  it('should have correct definition', () => {
    expect(command.definition.name).toBe('config');
    expect(command.definition.description).toBeTruthy();
  });

  it('should list default configuration', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await command.execute(['list'], { json: true }, mockContext);

    expect(result.success).toBe(true);
    // Should return default config
    spy.mockRestore();
  });

  it('should get a configuration value', async () => {
    const result = await command.execute(['get', 'defaultOutput'], { json: true }, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should set a local configuration value', async () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const result = await command.execute(['set', 'defaultOutput', 'json'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(writeSpy).toHaveBeenCalled();
    const [path, content] = writeSpy.mock.calls[0];
    expect(path).toContain('.jref/config.json');
    expect(JSON.parse(content as string).defaultOutput).toBe('json');
    writeSpy.mockRestore();
  });

  it('should set a global configuration value', async () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const result = await command.execute(['set', 'defaultOutput', 'raw', '--global'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(writeSpy).toHaveBeenCalled();
    const [path, content] = writeSpy.mock.calls[0];
    expect(path).toContain('/home/user/.jref/config.json');
    expect(JSON.parse(content as string).defaultOutput).toBe('raw');
    writeSpy.mockRestore();
  });

  it('should handle nested keys', async () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const result = await command.execute(['set', 'ui.theme', 'dark'], {}, mockContext);

    expect(result.success).toBe(true);
    const content = JSON.parse(writeSpy.mock.calls[0][1] as string);
    expect(content.ui.theme).toBe('dark');
    writeSpy.mockRestore();
  });

  it('should error on unknown action', async () => {
    const result = await command.execute(['unknown'], {}, mockContext);
    expect(result.success).toBe(false);
  });

  it('should error on missing key for get', async () => {
    const result = await command.execute(['get'], {}, mockContext);
    expect(result.success).toBe(false);
  });
});
