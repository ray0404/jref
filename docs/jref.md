# jref — JSON Reference CLI

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Global Options](#global-options)
6. [Command Reference](#command-reference)
   - [pack — Create Snapshots](#pack)
   - [inspect — View Snapshot Metadata](#inspect)
   - [search — Regex Search Within Snapshots](#search)
   - [query — Retrieve Specific File Content](#query)
   - [extract — Unpack Files to Filesystem](#extract)
   - [reconstruct — Verify Local vs Snapshot](#reconstruct)
   - [diff — Compare Snapshot to Local Filesystem](#diff)
   - [patch — Modify Snapshots Without Extraction](#patch)
   - [summarize — Generate Architectural Maps](#summarize)
   - [serve — MCP Server for AI Agents](#serve)
   - [ui — Interactive TUI Browser](#ui)
7. [Snapshot Schema](#snapshot-schema)
8. [AI Agent Workflows](#ai-agent-workflows)
9. [Target Environments](#target-environments)
10. [Use Cases](#use-cases)
11. [Exit Codes](#exit-codes)
12. [File Size and Streaming Behavior](#file-size-and-streaming-behavior)

---

## Overview

**jref** (JSON Reference) is a CLI tool for creating, inspecting, searching, and manipulating **condensed JSON project snapshots** — single JSON files that pack an entire codebase's file tree and file contents into one portable, streamable artifact. It is designed for both human developers and AI agents working in constrained environments (mobile, ARM, low-memory).

A snapshot captures:
- An ASCII directory tree (`directoryStructure`)
- All source file contents keyed by path (`files`)
- Optional AI instructions (`instruction`)
- Optional high-level project summary (`fileSummary`)
- Optional custom user header (`userProvidedHeader`)

---

## Features

| Feature | Description |
|---------|-------------|
| **pack** | Create a snapshot from a local directory (respects `.gitignore`). Includes **Secret Scanning**, **Auto-Instructions**, and **Chunking**. |
| **inspect** | View tree and metadata without loading the whole file into memory |
| **search** | High-speed regex / keyword search across all files in the snapshot |
| **query** | Pull out a single file's content by path (AI-friendly, supports `--raw`) |
| **extract** | Unpack specific files, directories, or the entire project to disk |
| **reconstruct** | Dry-run check: does the local directory match the snapshot? |
| **diff** | Compare snapshot contents against the live filesystem |
| **patch** | Update/add file contents or metadata in a snapshot without extracting |
| **summarize** | Strip implementation bodies, keep only signatures and imports |
| **serve** | Start an MCP (Model Context Protocol) stdio server for AI agents |
| **ui** | Interactive Terminal UI for browsing snapshots with **Fuzzy Search** and **Multi-Selection**. |

### Global Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--json` | `-j` | Output structured JSON (for AI consumption) |
| `--silent` | `-s` | Suppress all decorative/progress output |
| `--raw` | `-r` | Raw output — no formatting, pure content |
| `--jq` | `-q` | Apply a `jq` filter to reshape the snapshot |
| `--help` | `-h` | Show global help or command-specific help |
| `--version` | `-v` | Print version string |

All commands accept stdin pipe input, enabling patterns like:

```bash
cat snapshot.json | jref inspect
cat snapshot.json | jref search "TODO"
```

---

## Installation

### From Source

```bash
git clone <repo>
cd jref
npm install
npm run build

# Link globally
npm link

# Or install globally directly
npm install -g .
```

### Requirements

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Verifying Installation

```bash
jref --version
# jref v1.0.0

jref --help
```

---

## Quick Start

### Create a Snapshot

```bash
# Snapshot the current working directory
jref pack . > project.json

# Snapshot with AI instructions
jref pack ./my-project \
  --instruction "Follow these architectural rules" \
  --summary "REST API server with three route modules" \
  > project.json
```

### Inspect a Snapshot

```bash
# Full overview (metadata + tree + file list + summary)
jref inspect project.json

# Only the directory tree
jref inspect --structure project.json

# Only file list with sizes
jref inspect --files project.json

# Only metadata (file count, total size, etc.)
jref inspect --metadata project.json

# Pipe from stdin
cat project.json | jref inspect
```

### Search Within a Snapshot

```bash
# Literal keyword search (escapes regex metacharacters)
jref search "async function" project.json

# Regex search
jref search "class.*Controller" --regex project.json

# Case-insensitive
jref search "export" --case-insensitive project.json

# Limit results and show context lines
jref search "TODO" --max-results 50 --context 2 project.json

# JSON output (for AI agents)
jref search "function" --json project.json

# Pipe input
cat project.json | jref search "TODO"
```

### Query a Specific File

```bash
# Get file content (human-readable with header)
jref query --path "src/main.ts" project.json

# Raw output (pure content, ideal for AI parsing / piping to patch)
jref query --path "src/main.ts" --raw project.json

# Specific line range
jref query --path "src/main.ts" --line-start 10 --line-end 50 project.json

# JSON structured output
jref query --path "src/main.ts" --json project.json
```

### Extract Files

```bash
# Extract entire project to ./extracted/
jref extract project.json

# Extract to custom output directory
jref extract --output ./output project.json

# Extract only specific files
jref extract --paths src/main.ts src/utils.ts project.json

# Flat output (filename only, no directory structure)
jref extract --flat --output ./output project.json

# Dry run (preview what would be extracted)
jref extract --dry-run project.json

# Skip existing files (do not overwrite)
jref extract --output ./output project.json

# Overwrite existing files
jref extract --overwrite --output ./output project.json
```

### Verify Local vs Snapshot

```bash
# Check if current directory matches snapshot
jref reconstruct project.json

# Check against a specific directory
jref reconstruct --directory ./my-app project.json

# Verbose: show which files are missing, extra, or modified
jref reconstruct --verbose project.json

# JSON output
jref reconstruct --json project.json

# Ignore missing files (snapshot files not on disk)
jref reconstruct --ignore-missing project.json

# Ignore extra files (local files not in snapshot)
jref reconstruct --ignore-extra project.json
```

### Diff Snapshot Against Filesystem

```bash
# Compare snapshot to current directory
jref diff project.json

# Compare to a specific directory
jref diff --directory ./another-project project.json

# Include extra local files in diff output
jref diff --all project.json

# JSON structured output
jref diff --json project.json
```

### Patch a Snapshot (Surgical Edit)

```bash
# Update file content from argument
jref patch src/main.ts "new file content" project.json > updated.json

# Update file content from stdin (pipe a file's content in)
cat fix.ts | jref patch src/main.ts project.json > updated.json

# Update metadata only
jref patch --instruction "Updated: follow new linting rules" project.json > updated.json

# Update file summary
jref patch --summary "Refactored auth module" project.json > updated.json

# Update both file and metadata
jref patch src/main.ts "new content" \
  --instruction "Updated instructions" \
  project.json > updated.json

# Content detection: if second positional arg ends in .json it's treated
# as the snapshot file path, not content
jref patch src/main.ts updated-snapshot.json > patched.json
```

### Summarize (Architectural Map)

```bash
# Generate a token-efficient map (strips function bodies)
jref summarize project.json > map.json

# Pipe from stdin
cat project.json | jref summarize > map.json

# Summarize outputs a new valid snapshot with implementation details
# stripped — you can pipe it back through other jref commands
cat project.json | jref summarize | jref inspect --files
```

### Serve as MCP Server

```bash
# Start stdio MCP server (blocks)
jref serve project.json
```

The MCP server exposes three tools over stdio using the Model Context Protocol:

| Tool | Description |
|------|-------------|
| `inspect` | Returns snapshot metadata + directory structure as JSON |
| `search` | Searches files matching a regex pattern, returns matching file paths |
| `query` | Returns content of a specific file path |

This enables AI agents (Claude Code, Codex, etc.) to interactively browse and query the snapshot through their native MCP integration.

### Interactive TUI Browser

```bash
# Start the interactive browser
jref ui project.json
```

**Keyboard controls:**

| Key | Tree View | File View | Search Mode |
|-----|-----------|-----------|-------------|
| `↑` / `k` | Move up | Scroll up | Move up |
| `↓` / `j` | Move down | Scroll down | Move down |
| `←` / `h` | Collapse dir | — | — |
| `→` / `l` | Expand dir | — | — |
| `Enter` | Select/toggle | Back to tree | Select file |
| `Space` | Toggle selection `[*]` | — | — |
| `/` | Open fuzzy search | — | — |
| `Tab` | — | — | Toggle Search Type |
| `y` | Yank content | Yank content | — |
| `e` | Edit in `$EDITOR` | — | — |
| `v` | View in `$PAGER` | — | — |
| `x` | Extract selected | — | — |
| `c` | Toggle compact | Toggle compact | — |
| `Esc` | Exit | Back to tree | Cancel search |

**Mobile/Termux optimizations:**
- Compact mode auto-detected when terminal width < 60 columns
- Yank uses `termux-clipboard-set` on Termux, `pbcopy` on macOS, `xclip` on Linux
- Edit spawns `$EDITOR` (default: `vi`) for temporary in-memory edits

**Multi-Selection ([*]):** Press `Space` on any file or directory to mark it. Press `x` to extract all marked items at once to your local disk.

**Fuzzy Search:** Uses `fuse.js` for fast approximate matching by filename or file content (toggle search type with `Tab`).

---

## Global Options

These flags work with **any** command and must appear before the command name:

```
jref [--json|-j] [--silent|-s] [--raw|-r] [--help|-h] [--version|-v] <command> [args...]
```

| Option | Description |
|--------|-------------|
| `--json`, `-j` | Emit JSON instead of human-readable text. Every command supports this. |
| `--silent`, `-s` | Suppress all ASCII art, progress indicators, and decorative output. |
| `--raw`, `-r` | Emit raw output with no formatting. For `--query`, this means pure file content without headers. For AI agents consuming file content. |
| `--jq`, `-q <f>` | Apply a `jq` filter to reshape or filter the snapshot state in memory before any core command receives it. Uses `jq-wasm` for portability. |
| `--help`, `-h` | Show global help (all commands). Append to any command for command-specific help: `jref pack --help` |
| `--version`, `-v` | Print `jref v1.2.0` (or `--json` for `{"version": "1.2.0"}`). |

---

## Command Reference

---

### pack

Create a jref-compliant JSON snapshot from a local directory.

```
jref pack [directory] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--instruction <text>` | Add an `instruction` field to the snapshot — AI system prompt context. **Auto-generated** based on project type if omitted. |
| `--summary <text>` | Add a `fileSummary` field — human-readable project overview |
| `--max-size <bytes>` | Split the snapshot into multiple parts (e.g., `snapshot.part1.json`) if the total size exceeds this threshold. |

**Behavior:**
- Defaults to current working directory if no directory is given
- Reads `.gitignore` from the root of the target directory and respects its patterns
- **Secret Scanning**: Automatically redacts secrets (API keys, credentials) using `secretlint`.
- **Auto-Instructions**: Analyzes the project structure (Node.js, Rust, Go, Python, etc.) and generates context-aware system prompts.
- **Chunking**: When `--max-size` is provided, the project is partitioned into valid schema-compliant chunks.
- Always ignores `.git`
- Reads **all file contents as UTF-8 strings**
- Generates an ASCII tree representation for `directoryStructure`
- Non-code files (images, binaries) are stored as empty strings (or skipped if unreadable)

**Examples:**

```bash
# Snapshot current directory with auto-instructions and secret scanning
jref pack . > snapshot.json

# Snapshot src/ with custom instructions
jref pack ./src --instruction "This module follows TDD" > src.json

# Snapshot entire project and split into 512KB chunks
jref pack . --max-size 524288
```

---

### inspect

View `directoryStructure` and metadata **without loading the entire file into memory**. Supports streaming for large snapshots.

```
jref inspect [options] [file]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--metadata` | `-m` | Show only snapshot metadata (file count, total size, etc.) |
| `--structure` | `-t` | Show only the ASCII directory tree |
| `--files` | `-f` | Show only the file list with sizes |
| `--summary` | | Show `instruction`, `fileSummary`, and `userProvidedHeader` fields |

Without any flag, all sections are displayed.

**Output sections:**

- **Snapshot Metadata** — file count, total byte size, number of tree lines, presence of instruction/summary/header
- **Directory Structure** — the ASCII tree string
- **File List** — all file paths with human-readable sizes
- **Summary** — custom header, file summary, and AI instructions

**Examples:**

```bash
jref inspect snapshot.json
jref inspect --metadata snapshot.json
jref inspect --structure snapshot.json
jref inspect --files snapshot.json
jref inspect --summary snapshot.json
cat snapshot.json | jref inspect --json
```

---

### search

High-speed regex or literal keyword search across all file contents in a snapshot.

```
jref search <pattern> [options] [file]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--regex` | `-r` | Treat `<pattern>` as a regular expression (default: literal string) |
| `--case-insensitive` | `-i` | Case-insensitive match |
| `--files` | `-f` | Output only file paths that contain matches |
| `--max-results` | `-n` | Maximum number of files to return (default: 1000) |
| `--context` | `-c` | Number of context lines around each match (default: 0) |

**Output:** For each matching file, shows:
- File path and match count
- Up to 5 matching lines with highlighted match text (ANSI yellow)
- Remaining match count if > 5

**Examples:**

```bash
jref search "async" snapshot.json
jref search "class.*extends" --regex snapshot.json
jref search "TODO" --case-insensitive snapshot.json
jref search "export" --max-results 10 snapshot.json
jref search "function" --context 2 snapshot.json
cat snapshot.json | jref search "TODO"
```

---

### query

Retrieve the raw content of a specific file path from the snapshot. Designed for AI agent workflows.

```
jref query --path <path> [file]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--path <path>` | `-p` | **Required.** Path of the file to retrieve. |
| `--raw` | `-r` | Emit pure file content (no header, no formatting). Ideal for piping. |
| `--line-start <n>` | | Start reading from line `n` (1-indexed) |
| `--line-end <n>` | | Stop reading at line `n` (1-indexed, inclusive) |

**Examples:**

```bash
# Human-readable with header
jref query --path "src/main.ts" snapshot.json

# Pure content for AI parsing
jref query --path "src/main.ts" --raw snapshot.json

# Pipe query output to patch another snapshot
jref query --path "src/utils.ts" --raw snapshot.json | \
  jref patch src/utils.ts snapshot.json > updated.json

# Line range
jref query --path "src/main.ts" --line-start 10 --line-end 50 snapshot.json

# JSON structured output
jref query --path "src/main.ts" --json snapshot.json
```

---

### run

Execute a script directly from the JSON snapshot without permanent extraction.

```
jref run --path <script-path> [file] [script-args...]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--path <path>` | `-p` | Path to the script within the snapshot |

**Runner mapping:**

| Extension | Runner |
|-----------|--------|
| `.js` | `node` |
| `.ts` | `node --experimental-strip-types` |
| `.py` | `python3` |
| `.sh` | `bash` |

**Examples:**

```bash
# Run a setup script
jref run --path scripts/setup.ts project.json

# Run with arguments
jref run -p main.js snapshot.json -- --port 8080
```

---

### extract

Unpack files from a snapshot back into the local filesystem. Supports wildcard patterns.

```
jref extract [options] [file] [patterns...]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--output <dir>` | `-o` | Output directory (default: `./extracted`) |
| `--overwrite` | `-w` | Overwrite existing files on disk |
| `--dry-run` | `-n` | Preview what would be extracted without writing files |
| `--flat` | | Flatten: extract filenames only (no directory structure) |

**Examples:**

```bash
# Extract entire project
jref extract snapshot.json

# Extract with wildcards
jref extract snapshot.json "src/**/*.ts" "docs/*.md"

# Extract to custom directory
jref extract --output ./restored snapshot.json

# Flatten output (all files side by side)
jref extract --flat --output ./flat snapshot.json

# Dry run preview
jref extract --dry-run snapshot.json

# Overwrite existing
jref extract --overwrite snapshot.json
```

---

### reconstruct

Dry-run verification: checks whether a local directory's contents match the snapshot's expected state. Reports missing, extra, and modified files.

```
jref reconstruct [options] [file]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--directory <dir>` | `-d` | Local directory to compare against (default: `.`) |
| `--verbose` | `-v` | List the actual missing/extra/modified file names |
| `--ignore-missing` | | Only check for extra/modified, ignore missing files |
| `--ignore-extra` | | Only check for missing/modified, ignore extra local files |

**Exit codes:** `0` = perfect match, `1` = differences found.

**Files ignored during comparison:** `node_modules`, `.git`, `.svn`, `.hg`, `__pycache__`, `.DS_Store`, `Thumbs.db`, `.env`, `.env.local`, `dist`, `build`, `.cache`

**Examples:**

```bash
# Check if . matches the snapshot
jref reconstruct snapshot.json

# Check specific directory
jref reconstruct --directory ./my-app snapshot.json

# Verbose listing of differences
jref reconstruct --verbose snapshot.json

# JSON output for automation
jref reconstruct --json snapshot.json
```

---

### diff

Compare a snapshot against the local filesystem, listing files that differ.

```
jref diff [options] [file]
```

**Options:**

| Option | Alias | Description |
|--------|-------|-------------|
| `--directory <dir>` | `-d` | Target directory to compare against (default: current directory) |
| `--all` | `-a` | Include local files that are **not** in the snapshot in the output |

**Output classification:**

| Status | Meaning |
|--------|---------|
| `M` | Modified — content differs between snapshot and disk |
| `A` | Added to snapshot — file exists in snapshot but not on disk |
| `D` | Deleted from snapshot — file exists on disk but not in snapshot |

**Examples:**

```bash
jref diff snapshot.json
jref diff --directory ./staging snapshot.json
jref diff --all snapshot.json
jref diff --json snapshot.json
```

---

### patch

Update or add file contents and/or metadata in a snapshot **without extracting it to disk**. Supports stdin content piping. The canonical way to surgically mutate a snapshot.

```
jref patch [path] [content] [file.json]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--instruction <text>` | Set/update the `instruction` field |
| `--summary <text>` | Set/update the `fileSummary` field |

**Positional argument rules:**

| Args given | Interpretation |
|------------|----------------|
| `path` | `path` is the file to update; content comes from **stdin** |
| `path content` | `path` is the file to update; `content` is the new content string |
| `path file.json` | `path` is the file; `file.json` is the snapshot file path (no inline content) |
| `path content file.json` | All three explicitly provided |
| `file.json` (ends in `.json`) | Metadata-only update of that snapshot file |

**Stdin behavior:** If `content` is not provided as a positional arg and stdin is piped, the **entire stdin content** is used as the file's new content.

**Examples:**

```bash
# Content from argument
jref patch src/main.ts "const x = 1;" snapshot.json > updated.json

# Content from stdin
cat new-main.ts | jref patch src/main.ts snapshot.json > updated.json

# Update metadata only
jref patch --instruction "Follow the new style guide" snapshot.json > updated.json

# Update both content and metadata
cat new-auth.ts | jref patch src/auth.ts \
  --instruction "Auth module updated with OAuth2" \
  snapshot.json > updated.json

# Auto-detect: second positional ending in .json is the snapshot file
jref patch src/main.ts updated-snapshot.json > patched.json
```

---

### summarize

Generate a **token-efficient architectural map** by stripping implementation details from code files while preserving:
- All `import` / `export` statements
- All `function` / `class` / `interface` / `type` declarations
- All decorator lines (`@` prefix)
- Blank lines

Non-code files (`.json`, `.md`, `.txt`) are kept verbatim.

The output is a **valid snapshot** that can be piped back into other jref commands.

**Primary use case:** Injecting a compact overview of a large codebase into an LLM's context window without burning tokens on implementation details.

```
jref summarize [file]
```

**Examples:**

```bash
# Generate architectural map
jref summarize snapshot.json > map.json

# Chain: summarize then inspect only file list
cat snapshot.json | jref summarize | jref inspect --files

# JSON output
jref summarize --json snapshot.json
```

**Stripping behavior:**

| Line type | Kept? |
|-----------|-------|
| `import ...` | ✅ |
| `export ...` | ✅ |
| `function foo(...)` | ✅ (body stripped) |
| `class Foo ...` | ✅ (body stripped) |
| `interface ...` | ✅ |
| `type ...` | ✅ |
| `@decorator` | ✅ |
| Everything else | ❌ (replaced with `/* ... implementation details stripped ... */`) |

---

### serve

Start a **Model Context Protocol (MCP)** stdio server that exposes snapshot tools to AI agents. The server reads the snapshot file once at startup and serves requests over stdio using the MCP JSON-RPC protocol.

```
jref serve <file>
```

**MCP Tools exposed:**

| Tool | Input | Output |
|------|-------|--------|
| `inspect` | (none) | JSON with `metadata` and `directoryStructure` |
| `search` | `{ pattern: string }` | JSON array of file paths containing the pattern |
| `query` | `{ path: string }` | Raw file content as plain text |

**Examples:**

```bash
# Block and serve (use with agent runner)
jref serve snapshot.json
```

**Integration:** Connect the stdio transport to any MCP-compatible agent runner (Claude Code, etc.):

```bash
# Example: connect to Claude Code's MCP
claude --mcp "jref serve snapshot.json"
```

---

### ui

Interactive Terminal User Interface (TUI) for visually browsing a snapshot's directory tree and file contents. Built with Ink (React for CLI).

```
jref ui [file]
```

**Launch:** `jref ui snapshot.json`

**Two-pane layout:** The left/top shows the directory tree; selecting a file shows its content in the right/bottom pane.

**Controls:**

| Key | Tree View | File View | Search Mode |
|-----|-----------|-----------|-------------|
| `↑` / `k` | Move up | Scroll up | Move up |
| `↓` / `j` | Move down | Scroll down | Move down |
| `←` / `h` | Collapse dir | — | — |
| `→` / `l` | Expand dir | — | — |
| `Enter` | Select/toggle | Back to tree | Select file |
| `/` | Open search | — | — |
| `Tab` | — | — | Toggle Search Type |
| `y` | Yank content | Yank content | — |
| `e` | Edit in `$EDITOR` | — | — |
| `v` | View in `$PAGER` | — | — |
| `x` | Extract file | — | — |
| `c` | Toggle compact | Toggle compact | — |
| `Esc` | Exit | Back to tree | Cancel search |

**Yank behavior:**
- Termux: uses `termux-clipboard-set`
- macOS: uses `pbcopy`
- Linux: uses `xclip -selection clipboard`

**Edit behavior:** Spawns `$EDITOR` (default `vi`) with the file content in a temp file. On exit, the in-memory file is updated — **changes are not written back to the snapshot or the filesystem**.

**Compact mode:** Auto-enabled when terminal width < 60 columns. Shows abbreviated UI elements to fit narrow screens.

---

## Snapshot Schema

A valid jref snapshot is a JSON object conforming to this schema:

```json
{
  "directoryStructure": "ASCII tree string (required)",
  "files": {
    "path/to/file1.ts": "file content string (required)",
    "path/to/file2.py": "file content string"
  },
  "instruction": "AI system prompt context (optional)",
  "fileSummary": "Human-readable project overview (optional)",
  "userProvidedHeader": "Custom header note (optional)"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `directoryStructure` | `string` | ✅ Yes | ASCII tree representation of the directory layout |
| `files` | `object` | ✅ Yes | Map of relative file paths to their UTF-8 content strings |
| `instruction` | `string` | No | AI-specific instructions or context injected at pack time |
| `fileSummary` | `string` | No | Human-readable description of the project structure |
| `userProvidedHeader` | `string` | No | Arbitrary custom header or metadata note |

---

## AI Agent Workflows

### Context Injection

```bash
# Get a compact architectural map for initial planning
jref summarize project.json > map.json

# Inspect the summarized map
jref inspect --files map.json
```

### State Mutation

```bash
# AI suggests a fix; apply it directly to the snapshot
cat fix.ts | jref patch src/main.ts project.json > updated.json

# Chain: query → patch
jref query --path "src/utils.ts" --raw project.json | \
  sed 's/old/new/g' | \
  jref patch src/utils.ts project.json > updated.json
```

### Tool Interoperability

```bash
# Start MCP server for agent-native browsing
jref serve project.json
```

### Verification Loop

```bash
# After applying edits locally, verify against snapshot
jref reconstruct --verbose project.json

# Or diff to see all differences
jref diff --all project.json
```

### Streaming Large Snapshots

```bash
# For very large snapshots (>8MB), jref uses chunked streaming
# to avoid heap overflow on low-memory devices (Raspberry Pi, Termux)
# No special flag needed — handled automatically
jref inspect large-snapshot.json
```

---

## Target Environments

jref is engineered for constrained computing environments:

| Environment | Notes |
|-------------|-------|
| **Termux (Android)** | Full clipboard integration via `termux-clipboard-set`; ARM-compatible |
| **Raspberry Pi 4 (ARM)** | Chunked streaming for large snapshots; low memory footprint |
| **Standard Linux (x86)** | Full feature set |
| **macOS** | Full feature set; `pbcopy` for clipboard |

### Memory Management

- Snapshots **< 8MB**: loaded directly via `JSON.parse`
- Snapshots **≥ 8MB**: streamed in 64KB chunks to prevent heap overflow
- The TUI auto-activates compact mode on narrow terminals (< 60 columns)

---

## Use Cases

### 1. Code Review by AI Agent
```bash
jref pack ./project > snapshot.json
jref summarize snapshot.json > map.json
# Inject map.json into LLM context for architectural overview
# Use jref query for targeted file reads during review
```

### 2. Portable Development Context
```bash
# Create a shareable snapshot of a project
jref pack . --instruction "This is a React dashboard" > context.json

# Share the single JSON file instead of a zip
# Recipient: jref inspect context.json
```

### 3. Surgical Patch without Full Extraction
```bash
# Fix a bug in a file inside a snapshot without unpacking everything
cat fixed.ts | jref patch src/buggy.ts snapshot.json > fixed.json
```

### 4. Backup / Audit Trail
```bash
# Snapshot a project state
jref pack . --instruction "State at commit abc123" > state-abc123.json
# Store the JSON as an immutable artifact
```

### 5. CI/CD Verification
```bash
# In CI: ensure deployed code matches the approved snapshot
jref diff --all snapshot.json && echo "Match" || echo "Drift detected"
```

---

## Exit Codes

All jref commands return an exit code:

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error (file not found, invalid input, etc.) |
| `2` | Query target file not found in snapshot |
| MCP server | Runs indefinitely; no exit unless connection drops |

---

## File Size and Streaming Behavior

jref handles JSON snapshot files of any size through automatic streaming:

| Snapshot Size | Strategy |
|--------------|----------|
| < 8 MB | Direct `JSON.parse` — fast, single allocation |
| ≥ 8 MB | `stream-json` pipeline — prevents heap exhaustion |
| Up to 1GB+ | Fully supported via streaming callbacks |

The threshold is configurable internally via `MAX_BUFFER_SIZE` in `streaming-json.js` (currently 8MB).

---

## License

MIT