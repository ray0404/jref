---
name: jref-expert
description: Expert guide for AI agents to utilize the jref CLI and Model Context Protocol (MCP) server. Use this skill when you need to pack, analyze, query, or serve codebase snapshots. Triggers on keywords like "snapshot", "mcp", "repomix", "codebase analysis", and "jref".
---

# jref-expert

`jref` is a specialized CLI tool for interacting with "condensed" JSON project snapshots. It provides a token-efficient way for AI agents to analyze, query, and navigate large codebases.

## 🏛️ Architectural Hubs (God Nodes)
When first encountering a `jref` project or snapshot, prioritize understanding these hubs:
- `utils/command.ts`: The foundational Command pattern registry.
- `utils/streaming-json.ts`: Core OOM-safe JSON processing logic.
- `utils/output.ts`: Centralized formatting for human vs. agent output.
- `utils/binary.ts`: Binary detection and Base64 encoding handlers.

## 🚀 Core Workflows

### 1. Snapshot Generation (Packing)
Use `pack` to create a context-efficient map of a directory.
- **Optimization:** Use `--compress` and `--remove-comments` to save tokens.
- **Semantic:** Use `--semantic` to generate AST-aware chunks and local embeddings.
- **Hybrid:** Use `--include-binaries` to bundle small assets (icons, etc.).

### 2. Live Agent Interaction (MCP)
Run `jref serve [snapshot.json]` to expose the codebase via the Model Context Protocol.
- **Tools:** `inspect`, `search`, `query`, `summarize`, `list_directory`, `graph`.
- **Note:** The server uses `stdio` transport. Ensure your runner stays interactive.

### 3. Targeted Analysis
- **Summarize:** `jref summarize [file]` returns signatures only—perfect for high-level planning.
- **Validate:** `jref validate <target>` identifies the "Blast Radius" of a change.
- **Graph:** `jref graph --centrality` identifies architectural bottlenecks.

## 🔗 Detailed References
- **CLI Flags:** See [cli-reference.md](references/cli-reference.md)
- **MCP Tool Definitions:** See [mcp-tools.md](references/mcp-tools.md)
- **Graph Topology Guide:** See [graph-topology.md](references/graph-topology.md)

## 📂 Asset Library
- **Sample Snapshot:** Use `assets/sample-snapshot.json` for testing query logic.
- **Agent Prompt Template:** See `assets/agent-prompt.txt` for recommended system prompts.
