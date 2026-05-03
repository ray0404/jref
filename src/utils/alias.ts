import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { AliasConfig, AliasConfigSchema } from '../types/index.js';

const GLOBAL_CONFIG_DIR = join(homedir(), '.jref');
const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, 'config.json');
const LOCAL_CONFIG_DIR = join(process.cwd(), '.jref');
const LOCAL_CONFIG_PATH = join(LOCAL_CONFIG_DIR, 'config.json');
const DEBUG_LOG_PATH = join(LOCAL_CONFIG_DIR, 'debug.log');

/**
 * Log message to debug file
 */
export function logDebug(message: string): void {
  try {
    if (!existsSync(LOCAL_CONFIG_DIR)) {
      mkdirSync(LOCAL_CONFIG_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    appendFileSync(DEBUG_LOG_PATH, `[${timestamp}] ${message}\n`);
  } catch (err) {
    // Ignore logging errors to prevent CLI crashes
  }
}

/**
 * Load alias configuration from global and local files
 */
export function loadAliasConfig(): AliasConfig {
  let config: AliasConfig = {};

  // Load global config first
  if (existsSync(GLOBAL_CONFIG_PATH)) {
    try {
      const data = JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, 'utf8'));
      const parsed = AliasConfigSchema.safeParse(data);
      if (parsed.success) {
        config = { ...config, ...parsed.data };
      } else {
        logDebug(`Global config validation failed: ${parsed.error.message}`);
      }
    } catch (err) {
      logDebug(`Failed to read global config: ${(err as Error).message}`);
    }
  }

  // Load local config (overrides global)
  if (existsSync(LOCAL_CONFIG_PATH)) {
    try {
      const data = JSON.parse(readFileSync(LOCAL_CONFIG_PATH, 'utf8'));
      const parsed = AliasConfigSchema.safeParse(data);
      if (parsed.success) {
        config = { ...config, ...parsed.data };
      } else {
        logDebug(`Local config validation failed: ${parsed.error.message}`);
      }
    } catch (err) {
      logDebug(`Failed to read local config: ${(err as Error).message}`);
    }
  }

  return config;
}

/**
 * Save alias configuration
 */
export function saveAliasConfig(config: AliasConfig, isGlobal: boolean = false): void {
  const path = isGlobal ? GLOBAL_CONFIG_PATH : LOCAL_CONFIG_PATH;
  const dir = isGlobal ? GLOBAL_CONFIG_DIR : LOCAL_CONFIG_DIR;

  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    const errorMsg = `Failed to save config to ${path}: ${(err as Error).message}`;
    logDebug(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Expand aliases recursively with cyclic dependency detection
 */
export function expandAliases(args: string[], config: AliasConfig, visited: Set<string> = new Set()): string[] {
  if (args.length === 0) return args;

  const commandName = args[0];
  const remainingArgs = args.slice(1);

  if (config[commandName]) {
    if (visited.has(commandName)) {
      const cycle = Array.from(visited).concat(commandName).join(' -> ');
      const errorMsg = `Circular alias detected: ${cycle}`;
      logDebug(errorMsg);
      throw new Error(errorMsg);
    }

    visited.add(commandName);
    const expanded = config[commandName];
    // Recursively expand the first part of the alias if it's also an alias
    const result = expandAliases([...expanded, ...remainingArgs], config, visited);
    return result;
  }

  return args;
}
