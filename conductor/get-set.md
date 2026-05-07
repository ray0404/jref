# Dot-Notation Getters and Setters Implementation Plan

## Objective
Implement native `get` and `set` commands in the `jref` CLI to allow surgical, path-based querying and mutation of JSON snapshots using dot and bracket notation. This avoids relying on external tools like `jq` for basic inspection and modification.

## Key Files & Context
- **New Files**:
  - `src/utils/path-resolver.ts` (Core logic for path parsing)
  - `src/utils/path-resolver.test.ts` (Unit tests for parser)
  - `src/commands/get.ts` (The `get` CLI command)
  - `src/commands/get.test.ts` (Unit tests for `get`)
  - `src/commands/set.ts` (The `set` CLI command)
  - `src/commands/set.test.ts` (Unit tests for `set`)
- **Modified Files**:
  - `src/utils/command.ts` (Register `GetCommand` and `SetCommand`)

## Implementation Steps

### Phase 1: Path Resolution Utility (`src/utils/path-resolver.ts`)
1. Implement a custom, character-by-character state machine to parse paths (e.g., `files."src/main.ts"`, `metadata.instruction`, `files['test.js']`).
   - This approach is chosen over `eval()` for security.
   - It will support dot notation, bracket notation with single/double quotes, and unquoted brackets for array indices.
2. Implement `getValueByPath(obj: any, pathString: string): any`.
   - Traverses the object using parsed tokens.
   - Returns `undefined` if the path is invalid.
3. Implement `setValueByPath(obj: any, pathString: string, value: any): void`.
   - Traverses and assigns. 
   - Dynamically creates intermediate objects if they don't exist.
4. **TDD Step**: Write extensive unit tests in `src/utils/path-resolver.test.ts` validating tricky paths (escaped quotes, file paths with dots/slashes, array indices).

### Phase 2: Implement `get` Command
1. Create `src/commands/get.ts` extending `Command`.
2. Define usage: `jref get <path> [snapshot.json]`.
3. Execution logic:
   - Load snapshot (from file or stdin).
   - Use `getValueByPath`.
   - If not found, exit gracefully with code 1.
   - If found, format output via `printOutput` (from `utils/output.ts`). If the value is a string and `--raw` is active, emit it without quotes.
4. **TDD Step**: Write unit tests in `src/commands/get.test.ts`.

### Phase 3: Implement `set` Command
1. Create `src/commands/set.ts` extending `Command`.
2. Define usage: `jref set <path> <value> [snapshot.json]`.
3. Execution logic:
   - Load snapshot (from file or stdin).
   - Try to parse `value` as JSON (e.g., if the user passed an object/array string or boolean/number). If it fails to parse, treat it as a raw string.
   - Use `setValueByPath` to mutate the in-memory snapshot.
   - Print the modified snapshot to stdout using `JSON.stringify(snapshot, null, 2)`. As discussed, this will *not* overwrite the file by default unless redirected.
4. **TDD Step**: Write unit tests in `src/commands/set.test.ts`.

### Phase 4: Integration
1. Edit `src/utils/command.ts` to import and register `GetCommand` and `SetCommand` in `registerBuiltinCommands()`.

## Verification & Testing
- Ensure 80%+ coverage for new files.
- Verify `get` works with deeply nested keys like `files."src/app/index.ts"`.
- Verify `set` correctly modifies the AST and the JSON output is valid.
- Run the full test suite (`npm run test`) to ensure no regressions.
- Verify commands are visible in `jref --help`.
