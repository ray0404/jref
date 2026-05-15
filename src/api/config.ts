import { AliasCommand } from '../commands/alias.js';
import { ConfigCommand } from '../commands/config.js';
import { BinSetupCommand } from '../commands/bin-setup.js';

export interface AliasOptions {
  global?: boolean;
}

/**
 * Programmatically set a command alias
 */
export async function setAlias(
  name: string,
  expansion: string[],
  options: AliasOptions = {}
): Promise<any> {
  const cmd = new AliasCommand();
  const args: string[] = ['set', name, ...expansion];
  if (options.global) args.push('--global');

  const result = await cmd.execute(args, { json: true }, { stdin: '', stdinIsPipe: false });
  if (!result.success) throw new Error(result.error || 'Set alias failed');
  return result.data;
}

/**
 * Programmatically remove a command alias
 */
export async function removeAlias(
  name: string,
  options: AliasOptions = {}
): Promise<any> {
  const cmd = new AliasCommand();
  const args: string[] = ['remove', name];
  if (options.global) args.push('--global');

  const result = await cmd.execute(args, { json: true }, { stdin: '', stdinIsPipe: false });
  if (!result.success) throw new Error(result.error || 'Remove alias failed');
  return result.data;
}

/**
 * Programmatically list command aliases
 */
export async function listAliases(): Promise<any> {
  const cmd = new AliasCommand();
  const result = await cmd.execute(['list'], { json: true }, { stdin: '', stdinIsPipe: false });
  if (!result.success) throw new Error(result.error || 'List aliases failed');
  return result.data;
}

/**
 * Programmatically get or set CLI configuration
 */
export async function config(
  action: 'get' | 'set' | 'list' | 'reset',
  key?: string,
  value?: any
): Promise<any> {
  const cmd = new ConfigCommand();
  const args: string[] = [action];
  if (key) args.push(key);
  if (value !== undefined) args.push(typeof value === 'string' ? value : JSON.stringify(value));

  const result = await cmd.execute(args, { json: true }, { stdin: '', stdinIsPipe: false });
  if (!result.success) throw new Error(result.error || 'Config failed');
  return result.data;
}

/**
 * Programmatically setup the binary path for jref
 */
export async function setupBin(): Promise<void> {
  const cmd = new BinSetupCommand();
  const result = await cmd.execute([], {}, { stdin: '', stdinIsPipe: false });
  if (!result.success) throw new Error(result.error || 'Bin setup failed');
}
