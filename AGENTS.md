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

## Snapshot Schema

```json
{
  "directoryStructure": "ASCII tree string",
  "files": {"path/to/file.ts": "source code..."},
  "instruction": "AI system prompt context",
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
