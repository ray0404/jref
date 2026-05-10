# jref - JSON Reference CLI

`jref` is a lightweight, specialized CLI tool designed to interact with "condensed" JSON project snapshots. It serves as a bridge between local codebases and AI agents, providing token-efficient ways to package, query, and analyze code.

## 🚀 Project Overview

- **Core Mission:** Provide high-speed, structured, and AI-friendly access to codebase snapshots.
- **Key Audience:** Human developers (via TUI and CLI) and AI agents (via MCP and JSON outputs).
- **Primary Tech Stack:**
  - **Runtime:** Node.js (ES Modules)
  - **Language:** TypeScript
  - **TUI Framework:** React + Ink
  - **Packing Engine:** repomix
  - **Code Analysis:** web-tree-sitter (AST-aware)
  - **Search:** fuse.js (Fuzzy) + Transformers (Semantic/RAG)
  - **Graph Analysis:** graphology
  - **Protocols:** Model Context Protocol (MCP)

## 🏗️ Architecture & Structure

The project follows a modular, command-based architecture:

- `src/index.ts`: CLI entry point, handles global flags and command routing.
- `src/commands/`: Implementation of individual CLI commands (e.g., `pack`, `query`, `serve`).
  - Commands extend the `Command` base class in `src/utils/command.ts`.
- `src/utils/`: Shared logic and utilities.

### 🏛️ Architectural Hubs (God Nodes)
According to the latest graph analysis, these are the most central symbols/files that act as hubs for the system:
- `utils/command.ts`: The foundational Command pattern definition.
- `utils/streaming-json.ts`: Core streaming logic for memory-efficient snapshot processing.
- `utils/output.ts`: Centralized output and formatting hub.
- `utils/binary.ts`: Binary detection and encoding management.

Understanding these files is critical for understanding how the entire system communicates and handles data.

## 🛠️ Development Workflow

### Commands
- **Build:** `npm run build` (uses `tsc`)
- **Test:** `npm run test` (uses `vitest`)
- **Dev Mode:** `npm run dev` (uses `tsc --watch`)

### Adding a New Command
1. Create a new class in `src/commands/<name>.ts` extending `Command`.
2. Implement `execute`, `parseArgs`, and the `definition` property.
3. Register the command in `src/utils/command.ts` within `registerBuiltinCommands`.

### Testing Strategy
- **Framework:** Vitest
- **Location:** Co-located `*.test.ts` files.
- **Standard:** Aim for ~80% coverage. Use `ink-testing-library` for TUI components.

## 📋 Coding Conventions & Guidelines

- **ES Modules:** Always use `.js` extensions in imports (e.g., `import { x } from './utils.js'`).
- **Command Pattern:** Encapsulate all CLI logic within command classes.
- **AI-First Design:**
  - Always support the `--json` flag for structured data.
  - Use the `--raw` flag to emit pure content without decorative headers.
  - Ensure `serve` command remains interactive (don't consume stdin prematurely).
- **Performance:**
  - Prefer streaming processing (`processSnapshot`) for files that could be large.
  - Use `web-tree-sitter` for surgical code modifications or analysis.
- **Validation:** Use `zod` for validating inputs and configuration schemas.
- **Development Blueprints**: Follow the schema in `schemas/development-blueprint-schema.json` for planning and tracking complex features.
- **Roadmap Awareness**: The snapshot schema supports `roadmap` and `roadmap_status` fields to provide long-term context to agents.

## 🤖 AI Agent Integration (MCP)

`jref` natively supports the Model Context Protocol. AI agents can connect via `jref serve <snapshot.json>` to access:
- `inspect`: Metadata and tree structure.
- `search`: High-speed regex search.
- `query`: Targeted file reading or Semantic Search (RAG).
- `summarize`: Interface-only architectural maps.
- `list_directory`: Scoped file navigation.
- `graph`: Symbol dependency tracing.

## 📂 Key Snapshot Schema

Snapshots follow the schema in `schemas/project-snapshot-schema.json`:
- `directoryStructure`: Visual tree representation.
- `files`: Map of relative paths to full content.
- `chunks`: (Optional) Semantic code blocks with embeddings.
- `instruction`: Contextual prompt for AI agents.
- `roadmap`: (Optional) Project technical roadmap.
- `roadmap_status`: (Optional) Current status of the roadmap.
