# jref - JSON Reference CLI

A lightweight CLI tool to interact with "condensed" JSON project snapshots. Designed for both human developers and AI agents.

## Features

- **Inspect** - View directoryStructure and metadata without loading entire file
- **Search** - High-speed regex or keyword searching across all file entries
- **Extract** - Unpack specific files, directories, or entire project to filesystem
- **Query** - Get content of a specific file path (AI-friendly)
- **Reconstruct** - Dry-run mode to verify if local directory matches snapshot
- **UI** - Interactive Terminal User Interface for browsing snapshots (mobile-friendly)

## Target Environments

- Termux (Android/ARM)
- Raspberry Pi 4 (Linux/ARM)
- Standard x86 Linux

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
# Inspect a snapshot
jref inspect snapshot.json

# Interactive browsing (mobile-friendly)
jref ui snapshot.json

# Search for patterns
jref search "function" snapshot.json

# Extract files
jref extract --output ./output snapshot.json

# Query a specific file (great for AI agents)
jref query --path "src/main.ts" --raw snapshot.json

# Check if local directory matches snapshot
jref reconstruct --directory ./my-project snapshot.json
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

### inspect

View directoryStructure and metadata without loading entire file into memory.

```bash
jref inspect [options] [file]

Options:
  --metadata, -m     Show only metadata
  --structure, -s    Show only directory structure
  --files, -f        Show only file list
  --summary          Show instruction/summary/header
```

**Examples:**
```bash
jref inspect snapshot.json
jref inspect --metadata snapshot.json
jref inspect --structure snapshot.json
cat snapshot.json | jref inspect
```

### search

High-speed regex or keyword searching across all entries in the files object.

```bash
jref search <pattern> [options] [file]

Options:
  --regex, -r              Treat pattern as regex (default: literal)
  --case-insensitive, -i   Case-insensitive search
  --max-results, -n <num>  Maximum results to return (default: 1000)
  --context, -c <num>      Lines of context around matches
```

**Examples:**
```bash
jref search "function" snapshot.json
jref search "class.*Controller" --regex snapshot.json
jref search "TODO" --case-insensitive snapshot.json
jref search "async" --json snapshot.json
cat snapshot.json | jref search "export"
```

### extract

Unpack specific files, directories, or the entire project back into the local filesystem.

```bash
jref extract [options] [file]

Options:
  --output, -o <dir>   Output directory (default: ./extracted)
  --paths, -p <paths>  Specific file paths to extract
  --overwrite, -w      Overwrite existing files
  --dry-run, -n        Show what would be extracted without extracting
  --flat               Flatten directory structure
```

**Examples:**
```bash
jref extract snapshot.json
jref extract --output ./output snapshot.json
jref extract --paths src/main.ts src/utils.ts snapshot.json
jref extract --dry-run snapshot.json
cat snapshot.json | jref extract --output ./output
```

### query

Get content of a specific file path from the snapshot. Designed for AI agent usage.

```bash
jref query --path <path> [file]

Options:
  --path, -p <path>    File path to retrieve (required)
  --raw, -r            Raw output without formatting
  --line-start <num>   Start line for partial retrieval
  --line-end <num>     End line for partial retrieval
```

**Examples:**
```bash
jref query --path "src/main.ts" snapshot.json
jref query --path "src/main.ts" --raw snapshot.json
jref query --path "src/utils.ts" --json snapshot.json
jref query --path "src/main.ts" --line-start 10 --line-end 50 snapshot.json
cat snapshot.json | jref query --path "src/index.ts"
```

### reconstruct

Verify if a local directory matches the snapshot (dry-run/check mode).

```bash
jref reconstruct [options] [file]

Options:
  --directory, -d <dir>   Directory to check (default: current directory)
  --verbose, -v           Show detailed differences
  --ignore-missing        Ignore missing files
  --ignore-extra          Ignore extra files
```

**Examples:**
```bash
jref reconstruct snapshot.json
jref reconstruct --directory ./my-project snapshot.json
jref reconstruct --verbose snapshot.json
jref reconstruct --json snapshot.json
cat snapshot.json | jref reconstruct --directory ./src
```

### ui

Interactive Terminal User Interface for browsing project snapshots. Perfect for mobile/Termux users where typing long file paths is tedious.

```bash
jref ui [file]

Controls:
  ↑↓ Arrows       Navigate through all files/directories in tree
  ←→ Arrows       Expand/collapse directories
  Enter           Select file (view content) or toggle directory
  /               Search for files by name
  c               Toggle compact mode (mobile-friendly)
  Esc             Exit

Compact Mode (auto-enabled on narrow screens < 60 chars):
- Shorter file paths and headers
- Simplified instructions
- Optimized for mobile screens
```

**Examples:**
```bash
jref ui snapshot.json
cat snapshot.json | jref ui
```

**Features:**
- **Full Tree View**: See entire project structure with proper indentation
- **Expandable Directories**: Expand/collapse folders with arrow keys
- **File Content Viewer**: View file contents with line numbers and scrolling
- **Search Functionality**: Quickly find files by name with live filtering
- **Auto Mobile Detection**: Automatically adapts to narrow screens
- **Smooth Scrolling**: Selected item always stays visible while navigating
- **Visual Tree Structure**: Proper tree lines (├──, └──) showing hierarchy

## Global Options

These options work with all commands:

```bash
  --json, -j      Output in JSON format (for AI agents)
  --silent, -s    Suppress all progress and decorative output
  --raw, -r       Raw output mode (no formatting, for AI agents)
  --help, -h      Show help message
  --version       Show version information
```

## AI Agent Usage

jref is designed to be easily parseable by AI agents. Use these flags for AI-friendly output:

```bash
# Use --json for structured output
jref inspect --json snapshot.json

# Use --raw for pure content (no headers, no formatting)
jref query --path "src/main.ts" --raw snapshot.json

# Use --silent to suppress progress indicators
jref search "TODO" --silent snapshot.json
```

### Example AI Agent Integration

```bash
# Get file content for analysis
FILE_CONTENT=$(jref query --path "src/main.ts" --raw snapshot.json)

# Search across entire project
SEARCH_RESULTS=$(jref search "async function" --json snapshot.json)

# Check project structure
STRUCTURE=$(jref inspect --structure snapshot.json)
```

## Pipe Support

jref fully supports pipe input, making it easy to integrate into shell pipelines:

```bash
cat snapshot.json | jref inspect
cat snapshot.json | jref search "TODO"
cat snapshot.json | jref extract --output ./output
```

## Termux Path Handling

jref handles paths correctly for Termux environments where binaries live in non-standard locations:

```bash
# Works correctly in Termux
jref inspect /sdcard/snapshots/project.json

# Handles scoped storage appropriately
jref extract --output ~/storage/shared/output snapshot.json
```

## Performance

- **Streaming JSON parser** - Handles large snapshots (10MB+) without heap overflow
- **Chunked processing** - 64KB chunks for memory efficiency
- **Minimal dependencies** - No heavy frameworks
- **Fast startup** - < 50ms typical startup time

## Exit Codes

jref follows POSIX standards for exit codes:

- `0` - Success
- `1` - General error
- `2` - File not found or invalid input

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT