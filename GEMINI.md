# Project Overview: jref (JSON Reference CLI)

`jref` is a specialized TypeScript-based CLI tool designed for interacting with condensed project snapshots (JSON/YAML/TOML/XML). It is optimized for both human developers and AI agents, particularly in constrained environments like Termux (Android) and Raspberry Pi.

## Core Technology Stack
- **Language:** TypeScript (Node.js)
- **UI Framework:** Ink (React for CLI)
- **Data Handling:** `stream-json` (for large snapshot processing), `fast-xml-parser`, `yaml`, `toml`, `json5`, `jq-wasm` (for in-memory filtering)
- **Validation:** `zod`
- **Testing:** `vitest`
- **MCP:** `@modelcontextprotocol/sdk` (Model Context Protocol support)

## Architecture
- **Entry Point:** `src/index.ts`
- **Command Registry:** `src/utils/command.ts` manages command registration and dispatching.
- **Commands:** Located in `src/commands/`, each command implements a standard interface (e.g., `inspect`, `search`, `extract`, `ui`, `serve`).
- **TUI Components:** `src/components/` contains React components for the Ink-based terminal interface.
- **Streaming:** `src/utils/streaming-json.ts` provides optimized parsing for snapshots that might exceed available memory.

## Building and Running
The following commands are available for development and deployment:

```bash
# Install dependencies
npm install

# Build the project (compiles TS to JS in dist/)
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Development mode (compiles on changes)
npm run dev

# Global installation for local use
npm link
```

## CLI Usage (Directives)
When interacting with `jref` in this workspace, prefer the following patterns:

- **Analysis:** Use `jref inspect <file>` for a quick overview or `jref summarize <file>` to generate a token-efficient map.
- **Remote Resolution:** `jref pack <url>` allows snapshotting remote repositories (GitHub/GitLab) directly into jref format.
- **Data Transformation:** Use the global `--jq <filter>` or `-q <filter>` flag to reshape or filter snapshots before command execution.
- **Context Injection:** If you need to read specific files from a snapshot without extracting them, use `jref query --path <path> <file>`.
- **Modification:** Use `jref patch <path> <content> <file>` to surgically update a snapshot.
- **Testing Changes:** Use `jref diff <file>` to verify if local files match a snapshot's expected state.
- **Agent Integration:** `jref serve <file>` starts an MCP server (stdio) with tools for search, query, jq filtering, summarization, and reference tracing.

## Development Conventions
- **TDD:** Write unit tests in `*.test.ts` files alongside the implementation.
- **Modularity:** New commands should be added to `src/commands/` and registered in `src/utils/command.ts`.
- **Streaming First:** When handling snapshot data, prioritize streaming approaches (`processSnapshot`) to maintain performance in mobile/low-memory environments.
- **Type Safety:** Maintain strict TypeScript typing; use `Zod` schemas in `schemas/` for data validation where applicable.

## Target Environment Notes
- **Termux:** The TUI supports `termux-clipboard-set` via the `y` keybind and uses `$EDITOR` for in-memory edits.
- **Memory Management:** Be mindful of OOM errors on ARM devices; always use streaming for large files.
