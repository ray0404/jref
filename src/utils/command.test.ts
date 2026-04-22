import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommandRegistry, loadPlugins, Command } from './command.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Command System & Plugins', () => {
  let registry: CommandRegistry;
  const testPluginDir = join(tmpdir(), `jref-test-plugins-${Math.random().toString(36).slice(2)}`);

  beforeEach(() => {
    registry = new CommandRegistry();
    if (!existsSync(testPluginDir)) {
      mkdirSync(testPluginDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(testPluginDir)) {
      rmSync(testPluginDir, { recursive: true, force: true });
    }
  });

  it('should register and retrieve commands', () => {
    class TestCommand extends Command {
      definition = {
        name: 'test',
        description: 'test cmd',
        usage: 'test',
        examples: []
      };
      async execute() { return { success: true, exitCode: 0 }; }
      protected parseArgs() { return {}; }
    }

    const cmd = new TestCommand();
    registry.register(cmd);

    expect(registry.has('test')).toBe(true);
    expect(registry.get('test')).toBe(cmd);
    expect(registry.getCommandNames()).toContain('test');
  });

  // We can't easily test dynamic import() of a real file in this environment 
  // without complex setup, but we can verify the logic.
  // Actually, since we are in a real environment, we can try to write a real .js file.
  
  it('should load plugins from directory', async () => {
    const pluginContent = `
      export default {
        name: 'test-plugin',
        version: '1.0.0',
        register: (registry) => {
          class PluginCommand {
            definition = {
              name: 'plugged',
              description: 'from plugin',
              usage: 'plugged',
              examples: []
            };
            async execute() { return { success: true, exitCode: 0 }; }
          }
          registry.register(new PluginCommand());
        }
      };
    `;
    
    const pluginFile = join(testPluginDir, 'my-plugin.js');
    writeFileSync(pluginFile, pluginContent);

    // We use the global registry for loadPlugins usually, 
    // but loadPlugins in command.ts uses the exported 'registry' instance.
    // Let's check if we can pass a registry or if we should just check the global one.
    
    await loadPlugins(testPluginDir);
    
    // Import the global registry to check
    const { registry: globalRegistry } = await import('./command.js');
    expect(globalRegistry.has('plugged')).toBe(true);
  });
});
