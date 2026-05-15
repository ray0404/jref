/**
 * jref - Codebase Snapshot & Reference Library
 * Programmatic API for interacting with jref snapshots and graphs
 */

// Export Types
export * from './types/index.js';

// Export API Wrappers
export { pack, type PackOptions } from './api/pack.js';
export { query, type QueryOptions } from './api/query.js';
export { buildGraph, queryGraph, type GraphBuildOptions } from './api/graph.js';

// Export Core Utilities (useful for library users)
export { loadSnapshot, loadSnapshotFromFile, processSnapshot } from './utils/streaming-json.js';
export { setOutputHandler } from './utils/output.js';
export { Command, CommandRegistry, registry } from './utils/command.js';
