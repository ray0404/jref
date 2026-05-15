# Refactoring Plan: Exposing jref as a Library

## Objective
To transform `jref` from a strictly CLI-based application into a dual-purpose tool: a consumable TypeScript/JavaScript library, while maintaining 100% of its existing CLI capabilities and behavior.

## Current Architecture Constraints
Based on the `graphify` analysis and file inspections:
1. **Entry Point (`src/index.ts`)**: Currently acts as the CLI runner. It parses arguments, invokes commands, and immediately calls `process.exit()`. This makes it impossible to import and use `jref` programmatically without triggering CLI side-effects.
2. **Command Returns**: The `Command.execute` method returns a `CommandResult` that only contains `output: string` (often stringified JSON) and `exitCode: number`. It does not return the underlying typed objects (like `ProjectSnapshot`).
3. **I/O Coupling**: Commands frequently use `process.stdout.write` and `console.error` (wrapped via `src/utils/output.ts`). If imported as a library, these side-effects would pollute the consuming application's standard streams.

## Refactoring Strategy

### Phase 1: Data-Driven Command Results
**Goal:** Modify commands to return structured data alongside string outputs.

1. **Update `CommandResult` Type:**
   Modify `src/types/index.ts`:
   ```typescript
   export interface CommandResult<T = any> {
     success: boolean;
     exitCode: number;
     output?: string;
     data?: T;       // NEW: The raw typed object (e.g., ProjectSnapshot)
     error?: string;
   }
   ```
2. **Update Core Commands:**
   Update the execution logic in primary commands (`pack.ts`, `query.ts`, `graph.ts`, `extract.ts`, etc.) to populate the `data` field.
   *Example in `pack.ts`:*
   ```typescript
   // Instead of:
   // return this.success(JSON.stringify(snapshot));
   
   // Do:
   return { success: true, exitCode: 0, output: JSON.stringify(snapshot), data: snapshot };
   ```

### Phase 2: Decoupling CLI and API Entry Points
**Goal:** Separate the programmatic API from the CLI execution cycle.

1. **Rename the CLI Entry Point:**
   * Rename `src/index.ts` to `src/cli.ts`.
   * Update the `bin` field in `package.json` to point to `dist/cli.js`.
2. **Create the New API Entry Point (`src/index.ts`):**
   * This new file will serve as the programmatic interface.
   * Export types from `src/types/index.ts`.
   * Export specific functional wrappers for commands.
   ```typescript
   // src/index.ts
   export * from './types/index.js';
   export { pack } from './api/pack.js';
   export { query } from './api/query.js';
   export { getGraph } from './api/graph.js';
   ```

### Phase 3: Building Programmatic API Wrappers
**Goal:** Provide clean, typed functions for library consumers that abstract away the `Command` class instantiations.

1. **Create `src/api/` directory.**
2. **Implement Wrappers:**
   Create wrapper functions that instantiate a command, enforce `silent: true` options to prevent stdout pollution, execute the command, and return the `result.data`.
   ```typescript
   // src/api/pack.js
   import { PackCommand } from '../commands/pack.js';
   import { setOutputHandler } from '../utils/output.js';
   
   export async function pack(targetDir: string, options: PackOptions = {}): Promise<ProjectSnapshot> {
       // Suppress CLI output for programmatic usage
       const previousHandler = setOutputHandler(() => {}); 
       try {
           const cmd = new PackCommand();
           // Map API options to CLIOptions and command arguments
           const result = await cmd.execute([targetDir], { silent: true, json: true }, { stdin: '', stdinIsPipe: false });
           if (!result.success) throw new Error(result.error);
           return result.data as ProjectSnapshot;
       } finally {
           // Restore handler
           setOutputHandler(previousHandler);
       }
   }
   ```

### Phase 4: Package Configuration
**Goal:** Ensure npm/Node correctly resolves the library exports.

1. **Update `package.json`:**
   ```json
   {
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.js",
         "types": "./dist/index.d.ts"
       }
     },
     "bin": {
       "jref": "dist/cli.js",
       "jbin": "dist/cli.js"
     }
   }
   ```
2. **Update `tsconfig.json`** to ensure declaration files (`.d.ts`) are properly emitted for the API surface.

### Phase 5: Verification & Testing
1. **Unit Tests:** Ensure all existing CLI tests pass (the CLI now imports from `src/cli.ts` instead of `src/index.ts`).
2. **API Tests:** Create new integration tests targeting the `src/index.ts` exports to verify that calling programmatic functions does not exit the process and returns structured data.
3. **Graph Update:** Run `/graphify --update` to capture the new architectural nodes and ensure the "God Nodes" reflect the new CLI/API split.
