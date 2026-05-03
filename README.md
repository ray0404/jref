# jref - JSON Reference CLI

A lightweight CLI tool to interact with "condensed" JSON project snapshots. Designed for both human developers and AI agents.

## Features

- **Inspect** - View directoryStructure and metadata without loading entire file
- **Search** - High-speed regex or keyword searching across all file entries
- **Validate** - Analyze git diff blast radius and generate AI validation context
- **Extract** - Unpack specific files, directories, or entire project to filesystem (supports --stdout piping)
- **Query** - Get content by path or perform **Semantic Search** (RAG) across chunks
- **Reconstruct** - Dry-run mode to verify if local directory matches snapshot
- **UI** - Interactive Terminal User Interface for browsing snapshots (mobile-friendly)
- **Patch** - Update/add files and metadata in a snapshot via stdin or args
- **Serve** - Model Context Protocol (MCP) server for agentic interoperability
- **Diff** - Compare snapshot against local filesystem
- **Pack** - Native creation of snapshots from local directories (.gitignore support)
- **BPack** - Specialized binary-first snapshot creation for large assets
- **BExtract** - Specialized binary-first extraction (supports --stdout piping)
- **Summarize** - Generate token-efficient architectural maps (signatures only)
- **OpenAPI** - Transform OpenAPI specs into virtual filesystem snapshots
- **Run** - Execute scripts directly from a snapshot without extraction
- **Graph** - Analyze and visualize symbol/module dependency relationships
- **Alias** - Create and manage command shortcuts for complex workflows
- **Bin** - Manage virtual binaries and executable scripts
- **Config** - Persistent CLI configuration management
- **Tool** - Execute external commands and parse output into snapshots

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

## Global Options

The following flags can be used with any command:

- `--json, -j`: Output in JSON format (for AI agents)
- `--silent, -s`: Suppress all progress and decorative output
- `--raw, -r`: Raw output mode (no formatting)
- `--jq, -q <filter>`: Apply a `jq` filter to reshape the snapshot before command execution
- `--help, -h`: Show help message
- `--version, -v`: Show version information

## Commands
### pack

Create a snapshot from a local directory or remote repository (optimized for LLMs).

```bash
jref pack [directory|url] [options]

Options:
  --semantic               Enable AST-aware semantic chunking and local embeddings
  --instruction <text>     Add custom AI instructions (auto-generated if omitted)
  --summary <text>         Add a high-level file summary
  --max-size <bytes>       Split snapshot into chunks (JSON only)
  -s, --output-style <st>  Output format: json, markdown, xml, plain
  --branch <name>          Target specific branch (remote)
  --commit <hash>          Target specific commit (remote)
  --compress               Enable AST-aware whitespace removal
  --remove-comments        Strip code comments
  --remove-empty-lines     Strip blank lines
  --token-limit <n>        Cap the total output tokens
  --hashes                 Output a hash map of the directory instead of a snapshot
  --delta [remote-hashes]  Create a delta snapshot based on remote hashes
  --stream                 Enable real-time streaming mode for piped synchronization
```

**Features:**
- **Remote Packing**: Snapshot public or private repositories by providing a URL.
- **Optimization**: Use `--compress` and `--remove-comments` to reduce token counts for AI agents.
- **Multi-Format**: Export to Markdown or XML for better performance with specific LLMs.
- **Secret Scanning**: Automatically redacts secrets (API keys, tokens) using `secretlint`.
- **Token Authentication**: Automatically uses `GITHUB_TOKEN` or `GITLAB_TOKEN` from the environment.

**Examples:**
```bash
jref pack . --compress > project.json
jref pack https://github.com/user/repo --branch main > remote.json
jref pack . --output-style xml > snapshot.xml
jref pack . --max-size 1048576 # 1MB chunks (JSON only)
```

### bpack

Specialized binary-first snapshot creation for large datasets and assets.

```bash
jref bpack [directory] [options]

Options:
  --output, -o <file>      Output filename (default: stdout)
  --exclude <pattern>      Exclude files matching pattern
  --max-size <bytes>       Limit maximum size of a single binary file
```

### bextract

Unpack a JSON binary archive back to the filesystem.

```bash
jref bextract <file> [options] [patterns...]

Options:
  --output, -o <dir>  Target directory (default: ./extracted)
  --overwrite, -w     Overwrite existing files
  --dry-run           Show what would be extracted
  --stdout            Pipes a single decoded asset directly to stdout
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

### validate

Analyze git diff blast radius and generate AI validation context.

```bash
jref validate <target-branch> [options]

Options:
  --output, -o <file>  Output the validation snapshot to a file
  --depth, -d <n>      Maximum depth for dependency traversal (default: 1)
  --all, -a            Include all tracked files (ignores blast radius)
```

**Workflows:**
- **Blast Radius**: Automatically identify which files are affected by a change based on imports (supports TS, JS, Python, Rust, C++).
- **AI Verification**: Generates a snapshot with specific instructions for an LLM to perform boolean pass/fail validation of the changes.

**Examples:**
```bash
jref validate main --output validation.json
jref validate HEAD~1 --depth 2
```

### openapi

Transform an OpenAPI/RESTful specification into a queryable jref snapshot.

```bash
jref openapi <spec.json>
```

**Examples:**
```bash
# Transform and save
jref openapi api.json > snapshot.json

# Browse the virtual API structure
jref openapi api.json | jref ui
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
- `jq_query`: Execute jq filter against snapshot
- `summarize`: Get token-efficient map of specific files
- `list_directory`: Localized tree inspection (ls style)
- `find_references`: Cross-file symbol reference tracing

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

Get content of a specific file path or perform natural language **Semantic Search** (RAG) across code chunks.

```bash
jref query [options] [file]

Options:
  --path, -p <path>        Path of the file to query
  --semantic, -s <query>   Perform natural language search across code chunks
  --top-k <n>              Number of results for semantic search (default: 5)
  --raw, -r                Emit pure content without headers
```

**Examples:**
```bash
# Targeted reading
jref query --path "src/main.ts" snapshot.json

# Semantic RAG (requires snapshot packed with --semantic)
jref query --semantic "How are authentication tokens handled?" snapshot.json
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
  --stdout            Pipe a single decoded asset directly to stdout
  --listen            Listen on stdin for continuous stream of snapshots/deltas
```

**Examples:**
```bash
# Extract everything
jref extract project.json

# Extract specific files/dirs with wildcards
jref extract snapshot.json "src/**/*.ts" "docs/*"

# Pipe asset to another tool
jref extract --stdout snapshot.json "kick.wav" | ./dsp_tool

# Continuous sync (RPC mode)
jref extract --listen --output ./mirror
```

### run

Execute a script directly from the JSON snapshot without permanent extraction. Automatically detects the appropriate runner based on file extension or shebang (`#!`).

```bash
jref run --path <script-path> [file] [script-args...]
```

Options:
  --path, -p <path>   Path to the script within the snapshot

**Examples:**
```bash
# Run a setup script
jref run --path scripts/setup.ts project.json

# Run with arguments
jref run -p main.js snapshot.json -- --port 8080
```

### graph

Analyze and visualize dependency relationships between symbols and modules.

```bash
jref graph <subcommand> [target] [options]

Subcommands:
  build [target]           Build the knowledge graph from directory or snapshot
  query [target] [args]    Query the knowledge graph (experimental)
  wasm-update              Pre-fetch registered WASM binaries for offline use
  ui [target]              Start a local web server to visualize the graph

Options:
  --output, -o <file>      Save graph data to a file
  --format <fmt>           Output format: json, dot, mermaid (default: json)
  --depth <n>              Traversal depth (default: 1)
  --cluster                Detect and highlight modular clusters (Louvain method)
  --centrality             Highlight high-impact nodes using degree centrality
  --no-llm                 Skip semantic extraction using LLM
  -p, --port <number>      Port for the graph UI server (default: 8080)
```

**Examples:**
```bash
# Build a graph from the current directory
jref graph build .

# Start the interactive graph UI server
jref graph ui

# Pre-fetch WASM binaries
jref graph wasm-update
```

### alias

Create and manage command shortcuts for complex or frequent workflows.

```bash
jref alias <action> [name] [expansion]

Actions:
  set <name> <exp>     Create or update an alias
  remove <name>        Delete an alias
  list                 List all active aliases
```

**Examples:**
```bash
# Shortcut for compressed architecture map
jref alias set map "summarize --compress"

# Use the alias
jref map project.json
```

### bin

Manage virtual binaries and executable scripts stored within snapshots.

```bash
jref bin <action> [args...]

Actions:
  list                 List all virtual binaries in $JREF_BIN_PATH
  exec <name> [args]   Execute a virtual binary
  setup                Interactive setup of the bin environment
```

**Features:**
- **jbin**: When linked, `jbin` automatically executes the `bin` command for seamless script running.

### config

Persistent CLI configuration management.

```bash
jref config <action> [key] [value]

Actions:
  set <key> <val>      Update a configuration setting
  get <key>            View a configuration setting
  list                 Show all current settings
  ui                   Open the interactive configuration TUI
```

**Settings:**
- `defaultOutput`: json, pretty, raw
- `theme`: dark, light, system
- `silent`: true, false
- `aliasToggle`: true, false

### tool

Execute external commands and parse their output directly into snapshots.

```bash
jref tool <name> <command> [args...]

Parsers available:
  ls                   Standard directory listing to JSON
  git-log              Git history to structured JSON
  ps                   Process list to structured JSON
```

**Examples:**
```bash
# Snapshoting a directory listing via ls tool
jref tool ls "ls -la" > files.json
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
