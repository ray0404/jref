# Prompt

**Context:**
I am developing `jref`, a Node.js/TypeScript CLI tool designed to pack and extract condensed JSON project snapshots for AI agents and human developers. I need to integrate the core functionality of a Python script called `jtar`—which bundles and unbundles binary files using Base64 encoding inside a JSON payload—into `jref`. 

**Current Architecture:**
- `src/commands/pack.ts`: Uses `repomix` to generate the JSON snapshot. It sets `truncateBase64: true`, meaning binary files are excluded or corrupted.
- `src/commands/extract.ts`: Reconstructs projects from the JSON snapshot. It uses a streaming JSON parser (`processSnapshot`) and writes standard `utf8` text.
- `src/index.ts`: Houses the command registry where new commands must be initialized.
- `src/types/index.ts`: Defines `ProjectSnapshot`, currently assuming all `files` are UTF-8 string key-value pairs.

**The Objective:**
Expand `jref`'s capabilities to robustly handle both source code and binary assets (images, fonts, compiled binaries) using Base64 encoding. This requires a two-pronged approach: 
1. Creating dedicated, lightweight commands (`bpack` and `bextract`) for purely archiving raw/binary files without the overhead of `repomix`.
2. Enhancing the existing `pack` and `extract` commands to optionally support a "hybrid" mode where binaries are appended to the standard LLM-optimized codebase snapshot.

**Development Requirements & Specifications:**

1. **Type & Schema Expansion (`src/types/index.ts` & Schemas):**
   - Update data structures to distinguish standard text files from Base64 encoded files in the JSON snapshot (e.g., adding an encoding metadata map or altering the file entry structure). 
   - Ensure strict backwards compatibility with existing plain-text snapshots.

2. **Dedicated Commands (`src/commands/bpack.ts` & `src/commands/bextract.ts`):**
   - **`bpack`:** Implement a standalone command that completely bypasses `repomix`. It should traverse a target directory (or accept specific file paths), read all files as raw Buffers, encode them to Base64, and output a JSON bundle. This essentially mirrors `tar` but outputs JSON.
   - **`bextract`:** Implement the reverse of `bpack`. It must read the JSON bundle, decode the Base64 strings back to raw bytes (`Buffer.from(content, 'base64')`), and write them securely to the filesystem.
   - Both commands must be registered in `src/index.ts` or `src/utils/command.ts`.

3. **Enhancing Existing `pack.ts` (Hybrid Workflow):**
   - Implement a new flag: `--include-binaries`. 
   - When active, `pack` should run `repomix` for the source code as usual, but follow up with a post-processing step. This step must scan the directory for binary files skipped/truncated by `repomix`, encode them to Base64, and inject them into the final snapshot object.
   - Implement a `--max-binary-size <bytes>` flag to prevent massive binaries from causing V8 Out-Of-Memory (OOM) errors during stringification.

4. **Enhancing Existing `extract.ts` (Hybrid Workflow):**
   - Update the extraction logic to intercept files marked as Base64 in the snapshot.
   - Safely decode and write these files as binary, while continuing to write standard files as `utf8`.
   - Ensure seamless integration with the existing `stream-json` implementation in `src/utils/streaming-json.ts` so that chunked Base64 data doesn't exceed memory limits.

5. **Integration & Error Handling:**
   - I frequently work in purely CLI environments (Termux on Android, headless Linux/Raspberry Pi OS). Do NOT add debug steps that require me to manually log variables to the console, alter the codebase to view output, or use interactive GUI tools. 
   - Implement strict internal error handling (e.g., graceful failures for malformed Base64, missing read/write permissions, or path traversal attempts).
   - Ensure `--dry-run` flags accurately report the *decoded* size of binary files, not the bloated Base64 string size.

**Output Generation:**
Please provide the complete, updated TypeScript code for:
- `src/types/index.ts`
- `src/commands/bpack.ts` (New)
- `src/commands/bextract.ts` (New)
- `src/commands/pack.ts` (Updated)
- `src/commands/extract.ts` (Updated)
- Any utility functions necessary for binary detection and Base64 stream handling.

Explain the architectural decisions made, specifically focusing on memory management during Base64 conversion and how backwards compatibility is maintained.
