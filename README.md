# jref - JSON Reference CLI

A lightweight CLI tool to interact with "condensed" JSON project snapshots. Designed for both human developers and AI agents.

## Features

- **Inspect** - View directoryStructure and metadata without loading entire file
- **Search** - High-speed regex or keyword searching across all file entries
- **Extract** - Unpack specific files, directories, or entire project to filesystem
- **Query** - Get content of a specific file path (AI-friendly)
- **Reconstruct** - Dry-run mode to verify if local directory matches snapshot
- **UI** - Interactive Terminal User Interface for browsing snapshots (mobile-friendly)
- **Patch** - Update/add files and metadata in a snapshot via stdin or args
- **Serve** - Model Context Protocol (MCP) server for agentic interoperability
- **Diff** - Compare snapshot against local filesystem
- **Pack** - Native creation of snapshots from local directories (.gitignore support)
- **Summarize** - Generate token-efficient architectural maps (signatures only)
- **Run** - Execute scripts directly from a snapshot without extraction

## Target Environments

- Termux (Android/ARM)
- Raspberry Pi 4 (Linux/ARM)
- Standard x86 Linux

## Multi-Format Support

jref natively supports multiple snapshot formats:
- **JSON / JSON5 / JSONC** (.json, .json5, .jsonc)
- **YAML / YML** (.yaml, .yml)
- **TOML** (.toml)
- **Repomix XML** (.xml)

The tool automatically detects the format from the file extension or content.

## Installation

```bash
# From source
npm install
npm run build

# Link globally
npm link

# Or install directly
npm install -g jref
```

## Quick Start

```bash
# Create a snapshot from current directory
jref pack . > snapshot.json

# Inspect a snapshot
jref inspect snapshot.json

# Interactive browsing (mobile-friendly)
jref ui snapshot.json

# Search for patterns
jref search "function" snapshot.json

# Compare snapshot to local disk
jref diff snapshot.json

# Start MCP server for agents
jref serve snapshot.json
```

## Data Schema

jref works with JSON snapshots following this schema:

```json
{
  "directoryStructure": "String representing the file tree",
  "files": {
    "path/to/file1.ts": "file contents...",
    "path/to/file2.ts": "file contents..."
  },
  "instruction": "Optional context or AI instructions",
  "fileSummary": "Optional summary of files",
  "userProvidedHeader": "Optional custom header"
}
```

## Commands

### pack

Create a jref-compliant JSON snapshot from a local directory.

```bash
jref pack [directory] [options]

Options:
  --instruction <text>  Add custom AI instructions (auto-generated if omitted)
  --summary <text>      Add a high-level file summary
  --max-size <bytes>    Split snapshot into multiple chunks if it exceeds this size
```

**Features:**
- **Secret Scanning**: Automatically redacts secrets (API keys, tokens) using `secretlint`.
- **Auto-Instructions**: Incurs project type (e.g., Node.js, Rust, Go) and drafts system prompts automatically.
- **Chunking**: Splits large projects into manageable `snapshot.partN.json` files for small context windows.

**Examples:**
```bash
jref pack . > project.json
jref pack . --max-size 1048576 # 1MB chunks
```

### patch

Update or add files and metadata in a snapshot without extraction.

```bash
jref patch [path] [content] [file.json]

Options:
  --instruction <text>  Update snapshot instructions
  --summary <text>      Update snapshot summary
```

**Examples:**
```bash
# Update from args
jref patch src/main.ts "new code" project.json > updated.json

# Update from stdin
cat fix.ts | jref patch src/main.ts project.json > updated.json

# Update metadata only
jref patch --instruction "New rules" project.json > updated.json
```

### diff

Compare snapshot contents against the local filesystem.

```bash
jref diff [options] [file.json]

Options:
  --directory, -d <dir>   Target directory to compare against
  --all, -a               Find extra local files not in snapshot
```

**Examples:**
```bash
jref diff snapshot.json
jref diff --directory ./my-app snapshot.json
```

### serve

Start a Model Context Protocol (MCP) server to expose the snapshot to AI agents.

```bash
jref serve [file.json]
```

**MCP Tools Exposed:**
- `inspect`: Get metadata and structure
- `search`: Regex search across files
- `query`: Read specific file content

### summarize

Generate a token-efficient architectural map by stripping implementation details.

```bash
jref summarize [file.json]
```

**Implementation:** Strips function/class bodies, leaving only signatures and imports.

### ui

Interactive Terminal User Interface for browsing project snapshots.

```bash
jref ui [file]

Controls:
  ↑↓ Arrows / j,k Navigate tree/file
  ←→ Arrows / h,l Expand/collapse directories
  Enter           Select file (view) or toggle directory
  Space           Toggle selection (for multi-extraction)
  /               Fuzzy search files by name or content
  x               Extract selected files (or current file if no selection)
  y               Yank (copy) current file content to clipboard
  e               Edit current file in-memory using $EDITOR
  c               Toggle compact mode
  Esc             Back/Exit

Keybinds for Mobile/Termux:
- Yank (y): Uses `termux-clipboard-set` if available.
- Edit (e): Spawns your local editor (vi, nano, etc.) for temporary edits.
- Selection ([*]): Mark multiple files for batch extraction using `x`.
```

### inspect

View directoryStructure and metadata without loading entire file.

```bash
jref inspect [options] [file]

Options:
  --metadata, -m     Show only metadata
  --structure, -t    Show only directory structure
  --files, -f        Show only file list
  --summary          Show instruction/summary/header
```

### search

High-speed regex or keyword searching across all entries.

```bash
jref search <pattern> [options] [file]
```

### query

Get content of a specific file path. Optimized for AI agents.

```bash
jref query --path <path> [file]
```

### extract

Unpack files from snapshot to local filesystem. Supports wildcards and directory prefixes.

```bash
jref extract [options] [file] [patterns...]

Options:
  --output, -o <dir>  Target directory (default: ./extracted)
  --overwrite, -w     Overwrite existing files
  --dry-run, -n       Show what would be extracted
  --flat              Extract files into a single directory (no subfolders)
```

**Examples:**
```bash
# Extract everything
jref extract project.json

# Extract specific files/dirs with wildcards
jref extract snapshot.json "src/**/*.ts" "docs/*"

# Extract to specific directory
jref extract --output ./lib project.json "src/lib/*"
```

### run

Execute a script directly from the JSON snapshot without permanent extraction.

```bash
jref run --path <script-path> [file] [script-args...]

Options:
  --path, -p <path>   Path to the script within the snapshot
```

**Examples:**
```bash
# Run a setup script
jref run --path scripts/setup.ts project.json

# Run with arguments
jref run -p main.js snapshot.json -- --port 8080
```

## AI Agent Usage

jref is designed for agentic workflows. Use `--json` for structured output or `--raw` for pure content.

```bash
# Get summarized map for context
jref summarize project.json > map.json

# Use MCP in agent-enabled IDEs
jref serve project.json
```

## License

MIT
