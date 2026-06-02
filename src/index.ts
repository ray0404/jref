/**
 * jref - Codebase Snapshot & Reference Library
 * Programmatic API for interacting with jref snapshots and graphs
 */

// Export Types
export * from './types/index.js';

// Export API Wrappers
export { pack, type PackOptions } from './api/pack.js';
export { query, type QueryOptions } from './api/query.js';
export { buildGraph, queryGraph, topology, type GraphBuildOptions } from './api/graph.js';
export { search, type SearchOptions } from './api/search.js';
export { extract, diff, reconstruct, bpack, bextract, type ExtractOptions, type BPackOptions } from './api/fs.js';
export { flatten, unflatten, patch, summarize } from './api/transform.js';
export { validate, gitAnalyze, type ValidateOptions, type GitOptions } from './api/logic.js';
export { get, set, inspect, type InspectOptions } from './api/data.js';
export { startUI, startShell, mount, serve } from './api/interactive.js';
export { run, bin, tool, type RunOptions, type ToolOptions } from './api/execution.js';
export { setAlias, removeAlias, listAliases, config, setupBin, type AliasOptions } from './api/config.js';

// Export Core Utilities (useful for library users)
export { loadSnapshot, loadSnapshotFromFile, processSnapshot } from './utils/streaming-json.js';
export { setOutputHandler } from './utils/output.js';
export { Command, CommandRegistry, registry } from './utils/command.js';
export { UMFS, type UMFSMeta } from './utils/umfs.js';
