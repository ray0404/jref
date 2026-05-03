import fs from 'fs';
import path from 'path';
import os from 'os';
import { JrefConfigSchema, type JrefConfig } from '../types/index.js';

const getGlobalConfigPath = () => path.join(os.homedir(), '.jref', 'config.json');
const getLocalConfigPath = () => path.join(process.cwd(), '.jref', 'config.json');
const getDebugLogPath = () => path.join(process.cwd(), '.jref', 'debug.log');

/**
 * Fallback default configuration
 */
export const DEFAULT_CONFIG: JrefConfig = JrefConfigSchema.parse({});

/**
 * Logs a message to the debug log
 */
function logDebug(message: string): void {
  try {
    const debugLogPath = getDebugLogPath();
    const dir = path.dirname(debugLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    fs.appendFileSync(debugLogPath, `[${timestamp}] CONFIG_DEBUG: ${message}\n`);
  } catch (err) {
    // Silent fail for debug logging
  }
}

/**
 * Loads and merges configuration from global and local sources
 */
export function loadConfig(): JrefConfig {
  let config = { ...DEFAULT_CONFIG };
  const globalConfigPath = getGlobalConfigPath();
  const localConfigPath = getLocalConfigPath();

  // 1. Load Global Config
  if (fs.existsSync(globalConfigPath)) {
    try {
      const globalRaw = fs.readFileSync(globalConfigPath, 'utf8');
      const globalJson = JSON.parse(globalRaw);
      const parsedGlobal = JrefConfigSchema.partial().parse(globalJson);
      config = { ...config, ...parsedGlobal };
    } catch (err) {
      logDebug(`Failed to load global config: ${(err as Error).message}`);
    }
  }

  // 2. Load Local Config
  if (fs.existsSync(localConfigPath)) {
    try {
      const localRaw = fs.readFileSync(localConfigPath, 'utf8');
      const localJson = JSON.parse(localRaw);
      const parsedLocal = JrefConfigSchema.partial().parse(localJson);
      config = { ...config, ...parsedLocal };
    } catch (err) {
      logDebug(`Failed to load local config: ${(err as Error).message}`);
    }
  }

  return config;
}

/**
 * Saves configuration to the specified scope
 */
export function saveConfig(newConfig: Partial<JrefConfig>, scope: 'global' | 'local' = 'local'): void {
  const targetPath = scope === 'global' ? getGlobalConfigPath() : getLocalConfigPath();
  
  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existing: Partial<JrefConfig> = {};
    if (fs.existsSync(targetPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (err) {
        logDebug(`Failed to parse existing config at ${targetPath}: ${(err as Error).message}`);
      }
    }

    const merged = { ...existing, ...newConfig };
    // Validate before saving (even if partial)
    JrefConfigSchema.partial().parse(merged);

    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to save config to ${scope}: ${(err as Error).message}`);
  }
}
