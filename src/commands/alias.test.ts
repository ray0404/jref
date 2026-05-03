import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AliasCommand } from './alias.js';
import * as aliasUtils from '../utils/alias.js';
import { CommandContext } from '../types/index.js';

vi.mock('../utils/alias.js', () => ({
  loadAliasConfig: vi.fn(),
  saveAliasConfig: vi.fn()
}));

describe('AliasCommand', () => {
  let command: AliasCommand;
  let mockContext: CommandContext;

  beforeEach(() => {
    command = new AliasCommand();
    mockContext = {
      stdinIsPipe: false
    };
    vi.clearAllMocks();
  });

  it('should list aliases', async () => {
    const mockConfig = { 'l': ['inspect'] };
    vi.mocked(aliasUtils.loadAliasConfig).mockReturnValue(mockConfig);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await command.execute(['list'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('l'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('inspect'));
    consoleSpy.mockRestore();
  });

  it('should set an alias', async () => {
    const mockConfig = {};
    vi.mocked(aliasUtils.loadAliasConfig).mockReturnValue(mockConfig);

    const result = await command.execute(['set', 'l', 'inspect'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(aliasUtils.saveAliasConfig).toHaveBeenCalledWith({ 'l': ['inspect'] }, false);
  });

  it('should set a global alias', async () => {
    const mockConfig = {};
    vi.mocked(aliasUtils.loadAliasConfig).mockReturnValue(mockConfig);

    const result = await command.execute(['set', 'l', 'inspect', '--global'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(aliasUtils.saveAliasConfig).toHaveBeenCalledWith({ 'l': ['inspect'] }, true);
  });

  it('should remove an alias', async () => {
    const mockConfig = { 'l': ['inspect'] };
    vi.mocked(aliasUtils.loadAliasConfig).mockReturnValue(mockConfig);

    const result = await command.execute(['remove', 'l'], {}, mockContext);

    expect(result.success).toBe(true);
    expect(aliasUtils.saveAliasConfig).toHaveBeenCalledWith({}, false);
  });

  it('should return error on unknown subcommand', async () => {
    const result = await command.execute(['unknown'], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown subcommand');
  });

  it('should return error on missing subcommand', async () => {
    const result = await command.execute([], {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing subcommand');
  });
});
