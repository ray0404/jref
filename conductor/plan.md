# Implementation Plan: Flat Assignment Transpilation

## Objective
Implement `flatten` and `unflatten` CLI commands to transform deeply nested `jref` JSON snapshots into a discrete list of absolute path assignments, and vice versa. This enables standard POSIX line-processing on complex ASTs.

## Key Files & Context
- **New Files**:
  - `src/utils/flatten.ts`: Core engine for flattening and unflattening logic.
  - `src/utils/flatten.test.ts`: Test suite for the flattening engine (TDD).
  - `src/commands/flatten.ts`: CLI command implementation for `flatten`.
  - `src/commands/unflatten.ts`: CLI command implementation for `unflatten`.
- **Modified Files**:
  - `src/utils/command.ts`: Register the new commands.

## Implementation Steps

1. **Step 1: Test-Driven Development (TDD) Setup**
   - Create `src/utils/flatten.test.ts`.
   - Write tests for `flattenObject` to ensure dot-notation for alphanumeric keys and bracket-notation for special characters.
   - Write tests for `unflattenLines` to ensure paths are parsed correctly.
   - Write a strict symmetry test: `JSON.parse(JSON.stringify(obj))` must equal `unflattenLines(flattenObject(obj))`.

2. **Step 2: Implement Flattening Engine (`src/utils/flatten.ts`)**
   - Implement `flattenObject(obj: any, prefix: string = 'snapshot'): string[]`.
   - Use recursive traversal. Escape values with `JSON.stringify`.
   - Apply the formatting rule: `^[a-zA-Z0-9_]+$` uses dot notation; otherwise, bracket notation with quotes.
   - Implement `setValueByPath(obj: any, pathString: string, value: any)` to parse a mixed dot/bracket path and set the value on the target object.
   - Implement `unflattenLines(lines: string[]): any`.
   - Parse each line to extract the path (stripping `snapshot.`) and the JSON-serialized value.

3. **Step 3: Implement `flatten` Command (`src/commands/flatten.ts`)**
   - Create the `FlattenCommand` class extending `Command`.
   - Parse input (from stdin or file).
   - Stream the output of `flattenObject` line-by-line to `process.stdout` to handle large objects efficiently.

4. **Step 4: Implement `unflatten` Command (`src/commands/unflatten.ts`)**
   - Create the `UnflattenCommand` class extending `Command`.
   - Read lines from stdin.
   - Process lines through `unflattenLines` to reconstruct the JSON object.
   - Output the formatted JSON to stdout.

5. **Step 5: Register Commands**
   - Add `flatten` and `unflatten` to the builtin commands registry in `src/utils/command.ts`.

## Verification & Testing
- Run the full test suite using `npm run test` to verify `flatten.test.ts` passes.
- Manually test the commands using a sample `jref` snapshot:
  - `cat sample.json | jref flatten > flat.txt`
  - `cat flat.txt | jref unflatten > reconstructed.json`
  - `diff sample.json reconstructed.json` (should be identical in structure).
