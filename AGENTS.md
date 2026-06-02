# jref Agent Instructions

## Core Capabilities for Agents

jref is optimized for LLM agents working in mobile or Linux environments.

- **MCP Protocol**: Run `jref serve snapshot.json` to expose the codebase as a suite of tool-calling endpoints. Supports Tools, **Resources** (direct file access), and **Prompts** (templated agent workflows).
- **Roadmap Persistence**: Roadmap state is managed via CRDTs (Yjs) allowing for concurrent updates and distributed state synchronization.
- **Surgical Patching**: Use `jref patch` to modify files in a snapshot without full extraction. Supports piping code fixes directly.
- **Architectural Mapping**: Use `jref summarize` to get a signature-only map of a large codebase, saving context tokens.
- **Topology Analysis**: Use `jref topology` to assess complexity and structural integrity.
- **Verification**: Use `jref diff` to verify if your suggested changes in a snapshot match the local filesystem.
- **Interactive Git**: Agents can use `jref git` to manage virtual versioning, though the TUI is optimized for human eyes.
- **Universal JSON Tools**: Agents can now use `get` and `set` as generic JSON-manipulation tools (e.g., for updating `package.json` or config files).
- **UMFS Standards**: Use `jref umfs` to generate, parse, or validate filenames conforming to the Unified Metadata Filename Specification. `jref inspect` also supports this natively.

## Command Reference

| Command | Usage | Purpose |
| :--- | :--- | :--- |
| `pack` | `jref pack [dir]` | Create snapshot (with caching support) |
| `patch` | `jref patch [path] [content]` | Update snapshot content/metadata |
| `summarize` | `jref summarize [file]` | Strip implementation details for context |
| `serve` | `jref serve [file]` | Start MCP server (Tools, Resources, Prompts) |
| `graph` | `jref graph query [q]` | Perform graph traversal queries |
| `topology` | `jref topology [file]` | Complexity and SLOC analysis |
| `diff` | `jref diff [file]` | Compare snapshot vs local disk |
| `inspect` | `jref inspect [file]` | Get metadata, UMFS tags, and ASCII tree |
| `search` | `jref search [pattern]` | Regex search across all files |
| `query` | `jref query --path [p]` | Read specific file content |
| `git` | `jref git [sub]` | Virtual/Local git ops |
| `umfs` | `jref umfs [action]` | Parse/Validate UMFS filenames |
| `get` | `jref get [path]` | Generic JSON/Snapshot read |
| `set` | `jref set [p] [v]` | Generic JSON/Snapshot write |

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
  "roadmap_status": "Status of current blueprint/track",
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
...
