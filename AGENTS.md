# jref Agent Instructions

## Core Capabilities for Agents

jref is optimized for LLM agents working in mobile or Linux environments.

- **MCP Protocol**: Run `jref serve snapshot.json` to expose the codebase as a suite of tool-calling endpoints (metadata, search, query).
- **Surgical Patching**: Use `jref patch` to modify files in a snapshot without full extraction. Supports piping code fixes directly.
- **Architectural Mapping**: Use `jref summarize` to get a signature-only map of a large codebase, saving context tokens.
- **Verification**: Use `jref diff` to verify if your suggested changes in a snapshot match the local filesystem.

## Command Reference

| Command | Usage | Purpose |
| :--- | :--- | :--- |
| `pack` | `jref pack [dir]` | Create snapshot from local files |
| `patch` | `jref patch [path] [content]` | Update snapshot content/metadata |
| `summarize` | `jref summarize [file]` | Strip implementation details for context |
| `serve` | `jref serve [file]` | Start MCP server (stdio) |
| `diff` | `jref diff [file]` | Compare snapshot vs local disk |
| `inspect` | `jref inspect [file]` | Get metadata and ASCII tree |
| `search` | `jref search [pattern]` | Regex search across all files |
| `query` | `jref query --path [p]` | Read specific file content |

## Mobile/Termux Optimization

- **Clipboard**: The TUI supports `y` keybind to yank content using `termux-clipboard-set`.
- **Editor**: The TUI supports `e` keybind to spawn `$EDITOR` (vi/nano).
- **Streaming**: Large JSON files are handled via chunked processing to avoid OOM on mobile hardware.

## 🔗 Dependency & Community Analysis

For large-scale refactoring or deep understanding, agents should utilize the dependency graph data:

- **Graph Analysis**: Run `jref graph --format json` to get full dependency relationships.
- **God Nodes**: Prioritize understanding `utils/command.ts`, `utils/streaming-json.ts`, and `utils/output.ts` as they are the primary hubs of the system.
- **Modular Communities**: The codebase is partitioned into distinct communities (e.g., individual commands and their tests). Use `jref graph --cluster` to identify these boundaries.
- **Blast Radius**: Before making changes, run `jref validate <branch>` to automatically identify affected files based on import relationships.

## Snapshot Schema

```json
{
  "directoryStructure": "ASCII tree string",
  "files": {"path/to/file.ts": "source code..."},
  "instruction": "AI system prompt context",
  "roadmap": "Project technical roadmap/milestones",
  "fileSummary": "Project high-level overview"
}
```

## Agent Workflows

### 1. Context Injection
```bash
# Get signature map for initial planning
jref summarize project.json > map.json
```

### 2. State Mutation
```bash
# Apply a fix suggested by the LLM
cat fix.ts | jref patch src/main.ts project.json > updated.json
```

### 3. Tool Interoperability
Connect your agent runner to `node dist/index.js serve project.json` to enable live browsing.
# jref: DeepWiki Technical Report & Architectural Reference

## 1. Executive Overview & Technical Philosophy

### Core Purpose

`jref` (JSON Reference CLI) is a high-performance utility designed to serve as an **Architectural Intelligence Layer** for large-scale software codebases. By abstracting local source trees into condensed, structured JSON snapshots, it enables token-efficient context ingestion for AI agents and provides developers with a topological map of system dependencies.

### Architectural Paradigm

The project is built upon three foundational pillars:

1. **Memory-Efficiency (Streaming-First):** Optimized for low-memory environments like Termux and Raspberry Pi, using event-driven streaming parsers.

2. **Command Pattern Extensibility:** A strictly decoupled registry system allowing for rapid plugin integration.

3. **AST-Aware Analysis:** Utilizing WebAssembly-powered Tree-sitter for surgical symbol extraction and knowledge graph construction.


## 2. System Architecture & Data Flow

### Macro-Architecture

The system follows a 'Hub-and-Spoke' Command pattern. The `index.ts` entry point acts as the controller, delegating execution to a dynamically populated `CommandRegistry`. Core utilities like `streaming-json.ts` and `output.ts` provide the 'Hub' services consumed by individual 'Spoke' command implementations.

### Data Lifecycle

1. **Ingestion:** Data enters via standard I/O (stdin) or filesystem read. Large files trigger the `processSnapshot` stream.

2. **Normalization:** Input formats (XML, JSON5, TOML) are normalized into the canonical `ProjectSnapshot` schema via `format.ts`.

3. **Transformation:** The selected Command applies logic (searching, graph building, patching).

4. **Emission:** Results are passed to `output.ts` which applies global formatting (JSON, Raw, TUI) before final write to stdout.

### State & Persistence

`jref` adopts a stateless, functional approach. Persistence is handled through snapshot serialization, allowing the entire system state to be carried as a single JSON artifact.


## 3. Codebase Anatomy (The Deep Dive)

### Directory Structure

The repository follows a strictly modular layout designed for scalability and logical isolation:

- **`src/`**: The core logic container.

  - **`commands/`**: Implementation of the Command Pattern. Each file corresponds to a discrete CLI action.

  - **`utils/`**: Shared architectural hubs (streaming, hashing, output abstraction).

  - **`types/`**: Centralized Zod-backed type definitions.

  - **`components/`**: React/Ink-based TUI elements.

- **`schemas/`**: Formal JSON-Schema definitions for snapshots and graph data.

- **`docs/`**: Man-pages and user-facing documentation.


#### Module: `schemas/gemini-session-schema.json`

**Description:** This module provides integral logic for the gemini-session-schema subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `schemas/graph-snapshot-schema.json`

**Description:** This module provides integral logic for the graph-snapshot-schema subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `schemas/project-snapshot-schema.json`

**Description:** This module provides integral logic for the project-snapshot-schema subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `schemas/repomix-config-schema.json`

**Description:** This module provides integral logic for the repomix-config-schema subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `schemas/repomix-default-config.json`

**Description:** This module provides integral logic for the repomix-default-config subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `schemas/tree-output-schema.json`

**Description:** This module provides integral logic for the tree-output-schema subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/commands/alias.ts`

**Description:** This module provides integral logic for the alias subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/alias.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `AliasCommand` | Logic governing AliasCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `saveAliasConfig` | Logic governing saveAliasConfig operations. |
| Method | `saveAliasConfig` | Logic governing saveAliasConfig operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/bextract.ts`

**Description:** This module provides integral logic for the bextract subsystem.


**Dependencies:**

- `util`

- `stream`

- `../types/index.js`

- `../utils/binary.js`

- `path`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `BExtractCommand` | Logic governing BExtractCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/bin-setup.ts`

**Description:** This module provides integral logic for the bin-setup subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `../utils/command.js`

- `../utils/output.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `BinSetupCommand` | Logic governing BinSetupCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `printSuccess` | Logic governing printSuccess operations. |
| Method | `printWarning` | Logic governing printWarning operations. |
| Method | `unlinkSync` | Logic governing unlinkSync operations. |
| Method | `printWarning` | Logic governing printWarning operations. |
| Method | `unlinkSync` | Logic governing unlinkSync operations. |
| Method | `symlinkSync` | Logic governing symlinkSync operations. |
| Method | `printSuccess` | Logic governing printSuccess operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `getSystemBinPath` | Logic governing getSystemBinPath operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/bin.ts`

**Description:** This module provides integral logic for the bin subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `../utils/command.js`

- `./run.js`

- `fs`

- `os`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `BinCommand` | Logic governing BinCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `resolveSnapshotFile` | Logic governing resolveSnapshotFile operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `join` | Logic governing join operations. |
| Method | `logDiagnostic` | Logic governing logDiagnostic operations. |
| Method | `mkdirSync` | Logic governing mkdirSync operations. |
| Method | `appendFileSync` | Logic governing appendFileSync operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/bpack.ts`

**Description:** This module provides integral logic for the bpack subsystem.


**Dependencies:**

- `ignore`

- `../types/index.js`

- `../utils/binary.js`

- `path`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`

- `fs/promises`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `BPackCommand` | Logic governing BPackCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/config.ts`

**Description:** This module provides integral logic for the config subsystem.


**Dependencies:**

- `ink`

- `../types/index.js`

- `../utils/config.js`

- `../utils/command.js`

- `../utils/output.js`

- `../components/ConfigUI.js`

- `../utils/input.js`

- `react`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ConfigCommand` | Logic governing ConfigCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `runUI` | Logic governing runUI operations. |
| Method | `reestablishTTY` | Logic governing reestablishTTY operations. |
| Method | `saveConfig` | Logic governing saveConfig operations. |
| Method | `unmount` | Logic governing unmount operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `listConfig` | Logic governing listConfig operations. |
| Method | `flatten` | Logic governing flatten operations. |
| Method | `flatten` | Logic governing flatten operations. |
| Method | `printTable` | Logic governing printTable operations. |
| Method | `getConfig` | Logic governing getConfig operations. |
| Method | `setConfig` | Logic governing setConfig operations. |
| Method | `saveConfig` | Logic governing saveConfig operations. |
| Method | `resetConfig` | Logic governing resetConfig operations. |
| Method | `getNestedValue` | Logic governing getNestedValue operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/diff.ts`

**Description:** This module provides integral logic for the diff subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `../utils/command.js`

- `../utils/output.js`

- `crypto`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `DiffCommand` | Logic governing DiffCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `computeHash` | Logic governing computeHash operations. |
| Method | `findExtraFiles` | Logic governing findExtraFiles operations. |
| Method | `printHumanDiff` | Logic governing printHumanDiff operations. |
| Method | `printTable` | Logic governing printTable operations. |
| Method | `formatBytes` | Logic governing formatBytes operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/extract.ts`

**Description:** This module provides integral logic for the extract subsystem.


**Dependencies:**

- `readline`

- `micromatch`

- `util`

- `stream`

- `../types/index.js`

- `../utils/binary.js`

- `path`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ExtractCommand` | Logic governing ExtractCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `handleListen` | Logic governing handleListen operations. |
| Method | `read` | Logic governing read operations. |
| Method | `pushToPayload` | Logic governing pushToPayload operations. |
| Method | `processProtocolStream` | Logic governing processProtocolStream operations. |
| Method | `extractFile` | Logic governing extractFile operations. |
| Method | `outputDryRun` | Logic governing outputDryRun operations. |
| Method | `outputResults` | Logic governing outputResults operations. |
| Method | `formatBytes` | Logic governing formatBytes operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/flatten.ts`

**Description:** This module provides integral logic for the flatten subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/flatten.js`

- `../utils/streaming-json.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `FlattenCommand` | Logic governing FlattenCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/get.ts`

**Description:** This module provides integral logic for the get subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/path-resolver.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `GetCommand` | Logic governing GetCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/git.ts`

**Description:** This module provides integral logic for the git subsystem.


**Dependencies:**

- `../components/GitUI.js`

- `ink`

- `../types/index.js`

- `fs`

- `../utils/command.js`

- `isomorphic-git`

- `../utils/streaming-json.js`

- `../utils/git.js`

- `../utils/input.js`

- `child_process`

- `react`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `GitCommand` | Logic governing GitCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `unmount` | Logic governing unmount operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `reestablishTTY` | Logic governing reestablishTTY operations. |
| Method | `unmount` | Logic governing unmount operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `getLocalFiles` | Logic governing getLocalFiles operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/graph.ts`

**Description:** This module provides integral logic for the graph subsystem.


**Dependencies:**

- `../utils/graph-analysis.js`

- `../types/index.js`

- `path`

- `url`

- `../utils/graph-ast.js`

- `../utils/command.js`

- `../utils/output.js`

- `fs`

- `os`

- `http`

- `../utils/graph-semantic.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `GraphCommand` | Logic governing GraphCommand operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `updateWasm` | Logic governing updateWasm operations. |
| Method | `startUIServer` | Logic governing startUIServer operations. |
| Method | `printSuccess` | Logic governing printSuccess operations. |
| Method | `printInfo` | Logic governing printInfo operations. |
| Method | `printInfo` | Logic governing printInfo operations. |
| Method | `printInfo` | Logic governing printInfo operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `getNetworkIP` | Logic governing getNetworkIP operations. |
| Method | `buildGraph` | Logic governing buildGraph operations. |
| Method | `queryGraph` | Logic governing queryGraph operations. |
| Method | `getAllFiles` | Logic governing getAllFiles operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/inspect.ts`

**Description:** This module provides integral logic for the inspect subsystem.


**Dependencies:**

- `stream`

- `../types/index.js`

- `../utils/binary.js`

- `../utils/command.js`

- `../utils/output.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `InspectCommand` | Logic governing InspectCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `printHeader` | Logic governing printHeader operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `printMetadata` | Logic governing printMetadata operations. |
| Method | `printTable` | Logic governing printTable operations. |
| Method | `printStructure` | Logic governing printStructure operations. |
| Method | `printFileList` | Logic governing printFileList operations. |
| Method | `printTable` | Logic governing printTable operations. |
| Method | `printSummary` | Logic governing printSummary operations. |
| Method | `formatBytes` | Logic governing formatBytes operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/mount.ts`

**Description:** This module provides integral logic for the mount subsystem.


**Dependencies:**

- `../types/index.js`

- `webdav-server`

- `../utils/command.js`

- `fs`

- `../utils/webdav-vfs.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `MountCommand` | Logic governing MountCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/pack.ts`

**Description:** This module provides integral logic for the pack subsystem.


**Dependencies:**

- `../utils/instruction.js`

- `../types/index.js`

- `../utils/binary.js`

- `../utils/hashing.js`

- `path`

- `../utils/embeddings.js`

- `../utils/command.js`

- `../utils/chunking.js`

- `../utils/streaming-json.js`

- `fs`

- `../utils/input.js`

- `repomix`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `PackCommand` | Logic governing PackCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `unlinkSync` | Logic governing unlinkSync operations. |
| Method | `unlinkSync` | Logic governing unlinkSync operations. |
| Method | `binaryScanWalk` | Logic governing binaryScanWalk operations. |
| Method | `binaryScanWalk` | Logic governing binaryScanWalk operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/patch.ts`

**Description:** This module provides integral logic for the patch subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/streaming-json.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `PatchCommand` | Logic governing PatchCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/query.ts`

**Description:** This module provides integral logic for the query subsystem.


**Dependencies:**

- `stream`

- `../types/index.js`

- `../utils/embeddings.js`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `QueryCommand` | Logic governing QueryCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `executeSemanticQuery` | Logic governing executeSemanticQuery operations. |
| Method | `extractImports` | Logic governing extractImports operations. |
| Method | `extractLineRange` | Logic governing extractLineRange operations. |
| Method | `outputContent` | Logic governing outputContent operations. |
| Method | `formatBytes` | Logic governing formatBytes operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/reconstruct.ts`

**Description:** This module provides integral logic for the reconstruct subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ReconstructCommand` | Logic governing ReconstructCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `readFile` | Logic governing readFile operations. |
| Method | `directoryExists` | Logic governing directoryExists operations. |
| Method | `compareWithSnapshot` | Logic governing compareWithSnapshot operations. |
| Method | `collectLocalFiles` | Logic governing collectLocalFiles operations. |
| Method | `shouldIgnore` | Logic governing shouldIgnore operations. |
| Method | `outputResults` | Logic governing outputResults operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/run.ts`

**Description:** This module provides integral logic for the run subsystem.


**Dependencies:**

- `util`

- `stream`

- `../types/index.js`

- `path`

- `../utils/command.js`

- `crypto`

- `../utils/streaming-json.js`

- `fs`

- `child_process`

- `os`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `RunCommand` | Logic governing RunCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `rmSync` | Logic governing rmSync operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `spawnProcess` | Logic governing spawnProcess operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `resolve` | Logic governing resolve operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/search.ts`

**Description:** This module provides integral logic for the search subsystem.


**Dependencies:**

- `stream`

- `../types/index.js`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `SearchCommand` | Logic governing SearchCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `createRegex` | Logic governing createRegex operations. |
| Method | `searchContent` | Logic governing searchContent operations. |
| Method | `outputResults` | Logic governing outputResults operations. |
| Method | `highlightMatch` | Logic governing highlightMatch operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/serve.ts`

**Description:** This module provides integral logic for the serve subsystem.


**Dependencies:**

- `@modelcontextprotocol/sdk/types.js`

- `@modelcontextprotocol/sdk/server/stdio.js`

- `../types/index.js`

- `../utils/format.js`

- `../utils/ui.js`

- `@modelcontextprotocol/sdk/server/index.js`

- `../utils/command.js`

- `../utils/streaming-json.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ServeCommand` | Logic governing ServeCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/set.ts`

**Description:** This module provides integral logic for the set subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/path-resolver.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `SetCommand` | Logic governing SetCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `setValueByPath` | Logic governing setValueByPath operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/shell.ts`

**Description:** This module provides integral logic for the shell subsystem.


**Dependencies:**

- `node:vm`

- `../types/index.js`

- `node:fs`

- `../utils/command.js`

- `node:repl`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ShellCommand` | Logic governing ShellCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `resolvePromise` | Logic governing resolvePromise operations. |
| Method | `createCustomEval` | Logic governing createCustomEval operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `isRecoverableError` | Logic governing isRecoverableError operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/summarize.ts`

**Description:** This module provides integral logic for the summarize subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/format.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `SummarizeCommand` | Logic governing SummarizeCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `formatBytes` | Logic governing formatBytes operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/tool.ts`

**Description:** This module provides integral logic for the tool subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `../utils/tool-runner.js`

- `../utils/command.js`

- `fs`

- `../parsers/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ToolCommand` | Logic governing ToolCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `mkdirSync` | Logic governing mkdirSync operations. |
| Method | `appendFileSync` | Logic governing appendFileSync operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/ui.ts`

**Description:** This module provides integral logic for the ui subsystem.


**Dependencies:**

- `ink`

- `../types/index.js`

- `../utils/ui.js`

- `fs`

- `../utils/command.js`

- `../utils/input.js`

- `../utils/streaming-json.js`

- `../components/TUI.js`

- `react`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `UICommand` | Logic governing UICommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `reestablishTTY` | Logic governing reestablishTTY operations. |
| Method | `unmount` | Logic governing unmount operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `readFile` | Logic governing readFile operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/unflatten.ts`

**Description:** This module provides integral logic for the unflatten subsystem.


**Dependencies:**

- `../utils/command.js`

- `../utils/flatten.js`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `UnflattenCommand` | Logic governing UnflattenCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/commands/validate.ts`

**Description:** This module provides integral logic for the validate subsystem.


**Dependencies:**

- `../types/index.js`

- `../utils/dependency.js`

- `../utils/command.js`

- `../utils/streaming-json.js`

- `fs`

- `child_process`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ValidateCommand` | Logic governing ValidateCommand operations. |
| Method | `execute` | Logic governing execute operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `getChangedFiles` | Logic governing getChangedFiles operations. |
| Method | `getAllTrackedFiles` | Logic governing getAllTrackedFiles operations. |
| Method | `createValidationSnapshot` | Logic governing createValidationSnapshot operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/components/ConfigUI.ts`

**Description:** This module provides integral logic for the ConfigUI subsystem.


**Dependencies:**

- `react`

- `ink`

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `ConfigUI` | Logic governing ConfigUI operations. |
| Method | `setConfig` | Logic governing setConfig operations. |
| Method | `setStatusMessage` | Logic governing setStatusMessage operations. |
| Method | `setTimeout` | Logic governing setTimeout operations. |
| Method | `useInput` | Logic governing useInput operations. |
| Method | `onExit` | Logic governing onExit operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `updateValue` | Logic governing updateValue operations. |
| Method | `updateValue` | Logic governing updateValue operations. |
| Method | `updateValue` | Logic governing updateValue operations. |
| Method | `onSave` | Logic governing onSave operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `String` | Logic governing String operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/components/GitUI.ts`

**Description:** This module provides integral logic for the GitUI subsystem.


**Dependencies:**

- `isomorphic-git`

- `react`

- `ink`

- `../utils/git.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `GitUI` | Logic governing GitUI operations. |
| Method | `setStatusItems` | Logic governing setStatusItems operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setLogItems` | Logic governing setLogItems operations. |
| Method | `setLogItems` | Logic governing setLogItems operations. |
| Method | `refreshStatus` | Logic governing refreshStatus operations. |
| Method | `setStatusMessage` | Logic governing setStatusMessage operations. |
| Method | `setTimeout` | Logic governing setTimeout operations. |
| Method | `useInput` | Logic governing useInput operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `onExit` | Logic governing onExit operations. |
| Method | `refreshStatus` | Logic governing refreshStatus operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setCommitMessage` | Logic governing setCommitMessage operations. |
| Method | `setMutation` | Logic governing setMutation operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `refreshStatus` | Logic governing refreshStatus operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setMutation` | Logic governing setMutation operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `refreshStatus` | Logic governing refreshStatus operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `setCommitMessage` | Logic governing setCommitMessage operations. |
| Method | `setCommitMessage` | Logic governing setCommitMessage operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/components/TUI.ts`

**Description:** This module provides integral logic for the TUI subsystem.


**Dependencies:**

- `ink`

- `../types/index.js`

- `../utils/ui.js`

- `path`

- `fuse.js`

- `fs`

- `child_process`

- `os`

- `react`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `buildFlatTree` | Logic governing buildFlatTree operations. |
| Function | `SnapshotBrowser` | Logic governing SnapshotBrowser operations. |
| Method | `traverse` | Logic governing traverse operations. |
| Method | `traverse` | Logic governing traverse operations. |
| Method | `setExpandedDirs` | Logic governing setExpandedDirs operations. |
| Method | `setSelectedPaths` | Logic governing setSelectedPaths operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setIsCompactMode` | Logic governing setIsCompactMode operations. |
| Method | `setIsCompactMode` | Logic governing setIsCompactMode operations. |
| Method | `checkScreenSize` | Logic governing checkScreenSize operations. |
| Method | `setStatusMessage` | Logic governing setStatusMessage operations. |
| Method | `setTimeout` | Logic governing setTimeout operations. |
| Method | `setSearchResults` | Logic governing setSearchResults operations. |
| Method | `setSearchResults` | Logic governing setSearchResults operations. |
| Method | `setSearchResults` | Logic governing setSearchResults operations. |
| Method | `useInput` | Logic governing useInput operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSearchQuery` | Logic governing setSearchQuery operations. |
| Method | `setSearchResults` | Logic governing setSearchResults operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSelectedFile` | Logic governing setSelectedFile operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `onExit` | Logic governing onExit operations. |
| Method | `toggleSelection` | Logic governing toggleSelection operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `spawnSync` | Logic governing spawnSync operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `spawnSync` | Logic governing spawnSync operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `mkdirSync` | Logic governing mkdirSync operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `extractFile` | Logic governing extractFile operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `setSelectedPaths` | Logic governing setSelectedPaths operations. |
| Method | `extractFile` | Logic governing extractFile operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSearchQuery` | Logic governing setSearchQuery operations. |
| Method | `setSearchResults` | Logic governing setSearchResults operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setIsCompactMode` | Logic governing setIsCompactMode operations. |
| Method | `setSelectedFile` | Logic governing setSelectedFile operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `toggleExpansion` | Logic governing toggleExpansion operations. |
| Method | `setSelectedFile` | Logic governing setSelectedFile operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `toggleExpansion` | Logic governing toggleExpansion operations. |
| Method | `toggleExpansion` | Logic governing toggleExpansion operations. |
| Method | `setSelectedFile` | Logic governing setSelectedFile operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `setSearchType` | Logic governing setSearchType operations. |
| Method | `updateSearchResults` | Logic governing updateSearchResults operations. |
| Method | `setSearchQuery` | Logic governing setSearchQuery operations. |
| Method | `updateSearchResults` | Logic governing updateSearchResults operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSearchQuery` | Logic governing setSearchQuery operations. |
| Method | `updateSearchResults` | Logic governing updateSearchResults operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setSelectedIndex` | Logic governing setSelectedIndex operations. |
| Method | `setViewMode` | Logic governing setViewMode operations. |
| Method | `setSelectedFile` | Logic governing setSelectedFile operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `showStatus` | Logic governing showStatus operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |
| Method | `setScrollOffset` | Logic governing setScrollOffset operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/index.ts`

**Description:** This module provides integral logic for the index subsystem.


**Dependencies:**

- `./utils/config.js`

- `./types/index.js`

- `path`

- `./utils/command.js`

- `url`

- `./utils/output.js`

- `./utils/input.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Method | `printHeader` | Logic governing printHeader operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `printError` | Logic governing printError operations. |
| Method | `printVersion` | Logic governing printVersion operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `printGlobalHelp` | Logic governing printGlobalHelp operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `printGlobalHelp` | Logic governing printGlobalHelp operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `printError` | Logic governing printError operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `printError` | Logic governing printError operations. |
| Method | `exit` | Logic governing exit operations. |
| Method | `main` | Logic governing main operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/parsers/index.ts`

**Description:** This module provides integral logic for the index subsystem.


**Dependencies:**

- `./ls.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `ParserRegistry` | Logic governing ParserRegistry operations. |
| Interface | `ParserContext` | Logic governing ParserContext operations. |
| Interface | `Parser` | Logic governing Parser operations. |
| Method | `register` | Logic governing register operations. |
| Method | `get` | Logic governing get operations. |
| Method | `findForCommand` | Logic governing findForCommand operations. |
| Method | `getAllParsers` | Logic governing getAllParsers operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/parsers/ls.ts`

**Description:** This module provides integral logic for the ls subsystem.


**Dependencies:**

- `./index.js`



**Classes & Data Structures:**

- No public symbols exported (internal implementation).



**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/plugins/openapi.ts`

**Description:** This module provides integral logic for the openapi subsystem.


**Dependencies:**

- `../utils/command.js`

- `path`

- `../types/index.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Method | `execute` | Logic governing execute operations. |
| Method | `parseArgs` | Logic governing parseArgs operations. |
| Method | `translateToSnapshot` | Logic governing translateToSnapshot operations. |
| Method | `generateTree` | Logic governing generateTree operations. |
| Method | `render` | Logic governing render operations. |
| Method | `render` | Logic governing render operations. |


**Core Logic/Algorithms:**

The `execute` method serves as the primary entry point for the command logic, orchestrating argument parsing, context retrieval, and output generation.


---


#### Module: `src/types/index.ts`

**Description:** This module provides integral logic for the index subsystem.


**Dependencies:**

- `zod`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `CodeChunk` | Logic governing CodeChunk operations. |
| Interface | `SearchResult` | Logic governing SearchResult operations. |
| Interface | `SearchMatch` | Logic governing SearchMatch operations. |
| Interface | `ExtractOptions` | Logic governing ExtractOptions operations. |
| Interface | `ReconstructResult` | Logic governing ReconstructResult operations. |
| Interface | `QueryOptions` | Logic governing QueryOptions operations. |
| Interface | `CLIOptions` | Logic governing CLIOptions operations. |
| Interface | `CommandContext` | Logic governing CommandContext operations. |
| Interface | `CommandResult` | Logic governing CommandResult operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/alias.ts`

**Description:** This module provides integral logic for the alias subsystem.


**Dependencies:**

- `path`

- `os`

- `../types/index.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `logDebug` | Logic governing logDebug operations. |
| Function | `loadAliasConfig` | Logic governing loadAliasConfig operations. |
| Function | `saveAliasConfig` | Logic governing saveAliasConfig operations. |
| Function | `expandAliases` | Logic governing expandAliases operations. |
| Method | `mkdirSync` | Logic governing mkdirSync operations. |
| Method | `appendFileSync` | Logic governing appendFileSync operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `mkdirSync` | Logic governing mkdirSync operations. |
| Method | `writeFileSync` | Logic governing writeFileSync operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/binary.ts`

**Description:** This module provides integral logic for the binary subsystem.


**Dependencies:**

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `isBinaryBuffer` | Logic governing isBinaryBuffer operations. |
| Function | `isBinaryFile` | Logic governing isBinaryFile operations. |
| Function | `getFileEncoding` | Logic governing getFileEncoding operations. |
| Function | `decodeBase64` | Logic governing decodeBase64 operations. |
| Function | `encodeBase64` | Logic governing encodeBase64 operations. |
| Function | `getMagicNumbers` | Logic governing getMagicNumbers operations. |
| Function | `detectMimeType` | Logic governing detectMimeType operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/chunking.ts`

**Description:** This module provides integral logic for the chunking subsystem.


**Dependencies:**

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `chunkCode` | Logic governing chunkCode operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/command.ts`

**Description:** This module provides integral logic for the command subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `url`

- `./output.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `CommandRegistry` | Logic governing CommandRegistry operations. |
| Interface | `CommandOption` | Logic governing CommandOption operations. |
| Interface | `CommandDefinition` | Logic governing CommandDefinition operations. |
| Interface | `JrefPlugin` | Logic governing JrefPlugin operations. |
| Function | `loadPlugins` | Logic governing loadPlugins operations. |
| Function | `registerBuiltinCommands` | Logic governing registerBuiltinCommands operations. |
| Method | `getSnapshot` | Logic governing getSnapshot operations. |
| Method | `print` | Logic governing print operations. |
| Method | `printOutput` | Logic governing printOutput operations. |
| Method | `error` | Logic governing error operations. |
| Method | `printError` | Logic governing printError operations. |
| Method | `success` | Logic governing success operations. |
| Method | `printHelp` | Logic governing printHelp operations. |
| Method | `register` | Logic governing register operations. |
| Method | `get` | Logic governing get operations. |
| Method | `getCommandNames` | Logic governing getCommandNames operations. |
| Method | `has` | Logic governing has operations. |
| Method | `getAllCommands` | Logic governing getAllCommands operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/config.ts`

**Description:** This module provides integral logic for the config subsystem.


**Dependencies:**

- `path`

- `os`

- `../types/index.js`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `loadConfig` | Logic governing loadConfig operations. |
| Function | `saveConfig` | Logic governing saveConfig operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |
| Method | `logDebug` | Logic governing logDebug operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/dependency.ts`

**Description:** This module provides integral logic for the dependency subsystem.


**Dependencies:**

- `./y`

- `path`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `DependencyGraph` | Logic governing DependencyGraph operations. |
| Function | `buildDependentGraph` | Logic governing buildDependentGraph operations. |
| Function | `getBlastRadius` | Logic governing getBlastRadius operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/embeddings.ts`

**Description:** This module provides integral logic for the embeddings subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `getEmbeddingPipeline` | Logic governing getEmbeddingPipeline operations. |
| Function | `generateEmbedding` | Logic governing generateEmbedding operations. |
| Function | `cosineSimilarity` | Logic governing cosineSimilarity operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/flatten.ts`

**Description:** This module provides integral logic for the flatten subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `flattenObject` | Logic governing flattenObject operations. |
| Function | `unflattenLines` | Logic governing unflattenLines operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `setValueByPath` | Logic governing setValueByPath operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/format.ts`

**Description:** This module provides integral logic for the format subsystem.


**Dependencies:**

- `../types/index.js`

- `./streaming-json.js`

- `fast-xml-parser`

- `yaml`

- `toml`

- `json5`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `sniffFormat` | Logic governing sniffFormat operations. |
| Function | `translateSnapshot` | Logic governing translateSnapshot operations. |
| Function | `stripImplementation` | Logic governing stripImplementation operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/git.ts`

**Description:** This module provides integral logic for the git subsystem.


**Dependencies:**

- `./binary.js`

- `../types/index.js`

- `path`

- `isomorphic-git`

- `memfs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `createVirtualFs` | Logic governing createVirtualFs operations. |
| Function | `exportVirtualFs` | Logic governing exportVirtualFs operations. |
| Function | `getGitOptions` | Logic governing getGitOptions operations. |
| Function | `initRepo` | Logic governing initRepo operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `walk` | Logic governing walk operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/graph-analysis.ts`

**Description:** This module provides integral logic for the graph-analysis subsystem.


**Dependencies:**

- `graphology`

- `../types/index.js`

- `graphology-communities-louvain`

- `graphology-metrics/centrality/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `AnalysisResult` | Logic governing AnalysisResult operations. |
| Function | `analyzeGraph` | Logic governing analyzeGraph operations. |
| Function | `createGraph` | Logic governing createGraph operations. |
| Function | `getBlastRadius` | Logic governing getBlastRadius operations. |
| Function | `getCommunityNodes` | Logic governing getCommunityNodes operations. |
| Function | `generateGraphReport` | Logic governing generateGraphReport operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/graph-ast.ts`

**Description:** This module provides integral logic for the graph-ast subsystem.


**Dependencies:**

- `../types/index.js`

- `path`

- `os`

- `./config.js`

- `./output.js`

- `fs`

- `https`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `ensureWasm` | Logic governing ensureWasm operations. |
| Function | `extractGraphFromSource` | Logic governing extractGraphFromSource operations. |
| Method | `reject` | Logic governing reject operations. |
| Method | `downloadFile` | Logic governing downloadFile operations. |
| Method | `reject` | Logic governing reject operations. |
| Method | `reject` | Logic governing reject operations. |
| Method | `reject` | Logic governing reject operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/graph-semantic.ts`

**Description:** This module provides integral logic for the graph-semantic subsystem.


**Dependencies:**

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `SemanticExtractionOptions` | Logic governing SemanticExtractionOptions operations. |
| Function | `inferSemanticEdges` | Logic governing inferSemanticEdges operations. |
| Function | `buildSemanticPrompt` | Logic governing buildSemanticPrompt operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/hashing.ts`

**Description:** This module provides integral logic for the hashing subsystem.


**Dependencies:**

- `crypto`

- `path`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `FileHashMap` | Logic governing FileHashMap operations. |
| Function | `generateFileHashMap` | Logic governing generateFileHashMap operations. |
| Function | `getDeltaPaths` | Logic governing getDeltaPaths operations. |
| Method | `walk` | Logic governing walk operations. |
| Method | `walk` | Logic governing walk operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/input.ts`

**Description:** This module provides integral logic for the input subsystem.


**Dependencies:**

- `tty`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `isStdinPiped` | Logic governing isStdinPiped operations. |
| Function | `readFromInput` | Logic governing readFromInput operations. |
| Function | `reestablishTTY` | Logic governing reestablishTTY operations. |
| Function | `readStdinSync` | Logic governing readStdinSync operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `clearTimeout` | Logic governing clearTimeout operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `clearTimeout` | Logic governing clearTimeout operations. |
| Method | `reject` | Logic governing reject operations. |
| Method | `clearTimeout` | Logic governing clearTimeout operations. |
| Method | `resolve` | Logic governing resolve operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/instruction.ts`

**Description:** This module provides integral logic for the instruction subsystem.


**Dependencies:**

- `path`

- `fs`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `generateInstruction` | Logic governing generateInstruction operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/output.ts`

**Description:** This module provides integral logic for the output subsystem.


**Dependencies:**

- `../types/index.js`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `formatOutput` | Logic governing formatOutput operations. |
| Function | `printOutput` | Logic governing printOutput operations. |
| Function | `printError` | Logic governing printError operations. |
| Function | `printSuccess` | Logic governing printSuccess operations. |
| Function | `printWarning` | Logic governing printWarning operations. |
| Function | `printInfo` | Logic governing printInfo operations. |
| Function | `printTable` | Logic governing printTable operations. |
| Function | `printProgress` | Logic governing printProgress operations. |
| Function | `printHeader` | Logic governing printHeader operations. |
| Function | `exit` | Logic governing exit operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/path-resolver.ts`

**Description:** This module provides integral logic for the path-resolver subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `parsePath` | Logic governing parsePath operations. |
| Function | `getValueByPath` | Logic governing getValueByPath operations. |
| Function | `setValueByPath` | Logic governing setValueByPath operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/streaming-json.ts`

**Description:** This module provides integral logic for the streaming-json subsystem.


**Dependencies:**

- `stream-json/parser.js`

- `./input.js`

- `stream`

- `../types/index.js`

- `./format.js`

- `fs`

- `jq-wasm`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Function | `parseJSON` | Logic governing parseJSON operations. |
| Function | `processSnapshot` | Logic governing processSnapshot operations. |
| Function | `generateDirectoryStructure` | Logic governing generateDirectoryStructure operations. |
| Function | `loadSnapshotFromFile` | Logic governing loadSnapshotFromFile operations. |
| Function | `loadSnapshot` | Logic governing loadSnapshot operations. |
| Function | `calculateMetadata` | Logic governing calculateMetadata operations. |
| Function | `validateSnapshot` | Logic governing validateSnapshot operations. |
| Function | `getFilePaths` | Logic governing getFilePaths operations. |
| Function | `extractFiles` | Logic governing extractFiles operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `checkFinished` | Logic governing checkFinished operations. |
| Method | `checkFinished` | Logic governing checkFinished operations. |
| Method | `render` | Logic governing render operations. |
| Method | `render` | Logic governing render operations. |


**Core Logic/Algorithms:**

The `processSnapshot` logic implements a high-performance streaming parser that utilizes an event-driven model to process massive JSON blobs with O(1) memory complexity.


---


#### Module: `src/utils/tool-runner.ts`

**Description:** This module provides integral logic for the tool-runner subsystem.


**Dependencies:**

- `child_process`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `ToolResult` | Logic governing ToolResult operations. |
| Interface | `ToolRunnerOptions` | Logic governing ToolRunnerOptions operations. |
| Function | `runTool` | Logic governing runTool operations. |
| Function | `spawnTool` | Logic governing spawnTool operations. |
| Method | `reject` | Logic governing reject operations. |
| Method | `resolve` | Logic governing resolve operations. |
| Method | `reject` | Logic governing reject operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/ui.ts`

**Description:** This module provides integral logic for the ui subsystem.


**Dependencies:**

- None (Self-contained).



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Interface | `TreeNode` | Logic governing TreeNode operations. |
| Function | `parseDirectoryStructure` | Logic governing parseDirectoryStructure operations. |
| Function | `getAllFilePaths` | Logic governing getAllFilePaths operations. |
| Function | `findNodeByPath` | Logic governing findNodeByPath operations. |
| Method | `traverse` | Logic governing traverse operations. |
| Method | `traverse` | Logic governing traverse operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


#### Module: `src/utils/webdav-vfs.ts`

**Description:** This module provides integral logic for the webdav-vfs subsystem.


**Dependencies:**

- `../types/index.js`

- `stream`

- `webdav-server`



**Classes & Data Structures:**

| Type | Name | Context |
| :--- | :--- | :--- |
| Class | `JrefFileSystem` | Logic governing JrefFileSystem operations. |
| Method | `super` | Logic governing super operations. |
| Method | `getItem` | Logic governing getItem operations. |
| Method | `normalizePath` | Logic governing normalizePath operations. |
| Method | `_type` | Logic governing _type operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_readDir` | Logic governing _readDir operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_openReadStream` | Logic governing _openReadStream operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_openWriteStream` | Logic governing _openWriteStream operations. |
| Method | `write` | Logic governing write operations. |
| Method | `next` | Logic governing next operations. |
| Method | `done` | Logic governing done operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_size` | Logic governing _size operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_create` | Logic governing _create operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_delete` | Logic governing _delete operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_propertyManager` | Logic governing _propertyManager operations. |
| Method | `callback` | Logic governing callback operations. |
| Method | `_lockManager` | Logic governing _lockManager operations. |
| Method | `callback` | Logic governing callback operations. |


**Core Logic/Algorithms:**

The module encapsulates discrete functional logic designed for modular integration within the broader command-based ecosystem.


---


## 4. Environment, Tooling & Execution

### Strict Dependencies

- **Runtime:** Node.js >= 18.0.0 (ES Modules)

- **Parsing Engine:** Tree-sitter (WASM)

- **Validation:** Zod 4.x

- **TUI:** React 18 / Ink 5

### Environment Context

Explicit support for **Android/Termux** is implemented through relative path handling for Unix sockets and pre-cached WASM binaries to avoid environment-specific binary compilation issues.

### Execution/Build Steps

1. `npm install`: Fetch dependencies.

2. `npm run build`: Compile TypeScript and build man-pages.

3. `npm link`: Global binary registration.

4. `npm test`: Execute Vitest suite.
