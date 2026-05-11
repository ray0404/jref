# `jref` Proposed & Completed Features

## 🟢 Completed

### 1. Agentic Patching / Snapshot Mutation (`patch`)
Dynamically update files or metadata inside a snapshot.
- **Status:** Done (v1.1.0)

### 2. TUI Workflow Integration (Yank & Edit)
`y` to copy, `e` to edit in-memory.
- **Status:** Done (v1.1.0)

### 3. Snapshot-to-Live Diffing (`diff`)
Compare snapshot against current working directory.
- **Status:** Done (v1.1.0)

### 4. Native Packing Capability (`pack`)
Create snapshots directly from local directories with `.gitignore` support.
- **Status:** Done (v1.1.0)

### 5. Model Context Protocol Server (`serve`)
Expose snapshot as tools for AI agents.
- **Status:** Done (v1.1.0)

### 6. Semantic Summarization (`summarize`)
Signature-only maps for architectural overview.
- **Status:** Done (v1.1.0)

---

## 🟡 Proposed Next (High Priority)

### 1. Interactive Partial Extraction
Allow users to use the TUI to visually select multiple files or directories for extraction.
- **Implementation:** `Space` to toggle selection, `x` to extract selected items.

### 2. Fuzzy Path Navigation (`find`)
Jump to files instantly by typing partial names in the TUI or a standalone command.
- **Implementation:** Integrate a fuzzy-matching algorithm (like `fuse.js`) into the Ink state.

### 3. Token-Aware Snapshot Chunking (`split`)
Automatically split a large snapshot into smaller chunks based on token limits.
- **Implementation:** Group files by directory or language until a limit is reached.

### 4. Secret Scanning and PII Redaction (`scrub`)
Auto-detect and redact keys/tokens during `pack` or `patch`.
- **Implementation:** Regex-based scanning for common credential patterns.

### 5. Virtual Pipe Execution (`run`)
Execute a script directly from the JSON without extraction.
- **Implementation:** `jref run --path scripts/db-migrate.ts snapshot.json`.

### 6. Automatic "Instruction" Generation
Auto-draft high-level system prompts based on structure and summaries.
- **Implementation:** Aggregate metadata to generate Markdown instruction blocks.

---

## 🔵 Future Backlog

### 7. Snapshot-to-Snapshot Diffing
Compare two different JSON snapshots.
### 8. Snapshot Merging (`merge`)
Combine multiple snapshots into one, with conflict resolution.
### 9. Snapshot Encryption (`vault`)
AES-256-GCM encryption for portable snapshot security.
### 10. Semantic "Context-Grep"
Return entire functions or blocks instead of just lines.
### 11. Dependency Mapping & Visualization
Analyze imports to build a relationship graph.
