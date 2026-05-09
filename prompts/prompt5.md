# Prompt: Implement Remote Packing and Advanced MCP Tools in `jref`

**Role:** You are an expert Node.js/TypeScript systems programmer. You are working on `jref` (JSON Reference CLI), a tool designed to manage multi-megabyte codebase snapshots. The tool is frequently executed in constrained environments (Android Termux, headless Linux/ARM clusters), so memory efficiency, minimal dependencies, and strict adherence to streaming/low-allocation architectures are paramount.

**Objective:** You will implement two major feature sets:
1. Extend the `jref pack` command to support remote repository resolution using `repomix`.
2. Expand the `jref serve` command (MCP server) with four new read-only tools: `jq_query`, `summarize`, `list_directory`, and `find_references`.

---

## Phase 1: Extending `jref pack` (Remote Packing)
**Target File:** `src/commands/pack.ts`

Currently, `pack.ts` executes `repomix.pack(['.'], config)` to snapshot a local directory. You must extend the argument parsing and execution logic to support remote repositories.

**Implementation Requirements:**
1. **URI Detection:** Modify the argument parser to detect if the `targetDir` is a remote URI (e.g., starts with `http://`, `https://`, `github:`, `gitlab:`, or `bitbucket:`). 
2. **Target Specifiers:** - Extract branch, tag, or commit hashes if appended (e.g., `https://github.com/user/repo@v2.0.0` or `github:user/repo#development`).
   - Extract subdirectory paths if provided (e.g., `github:user/repo/packages/core`).
3. **Repomix Configuration:**
   - If a remote URI is detected, pass it as the target to the `pack()` function instead of `'.'`.
   - Ensure the `repomix` config object securely passes through authentication tokens. Map `process.env.GITHUB_TOKEN` and `process.env.GITLAB_TOKEN` to the appropriate `repomix` configuration options (or rely on `repomix`'s native environment variable pickup, ensuring it is documented).
4. **Fallback:** If the argument is not a remote URI, gracefully fall back to the existing local directory packing logic.

---

## Phase 2: Extending `jref serve` (MCP Server)
**Target Files:** `src/commands/serve.ts`, `src/commands/summarize.ts`, `src/utils/ui.ts`

The MCP server currently provides `inspect`, `search`, and `query`. You must add four new read-only tools to the server's capabilities. Do NOT implement any mutative or state-changing tools (no patching or writing to disk).

### Tool 1: `jq_query`
**Description:** Execute a jq filter against the loaded snapshot.
**Implementation:**
- **Input Schema:** `{ filter: string }`
- **Logic:** Import `jq` from the existing `jq-wasm` dependency. Execute the provided filter string against the `snapshot` object in memory. 
- **Return:** The JSON stringified result of the jq transformation. Handle execution errors gracefully, returning an MCP error if the filter is malformed.

### Tool 2: `summarize`
**Description:** Provide a token-efficient map of specific files by stripping implementation details.
**Implementation:**
- **Input Schema:** `{ paths: string[] }`
- **Logic:** The `stripImplementation` logic currently resides inside `src/commands/summarize.ts`. You must extract this method into a shared utility function (e.g., `src/utils/format.ts` or a new `src/utils/summarize.ts`) so both the command and the MCP server can use it.
- **Action:** Iterate through the requested paths. For each, retrieve the content from `snapshot.files`, pass it through the shared `stripImplementation` function, and return an object mapping the paths to their summarized contents.

### Tool 3: `list_directory`
**Description:** Provide scoped, localized tree inspection to mimic standard `ls` navigation.
**Implementation:**
- **Input Schema:** `{ path: string }` (e.g., `src/dsp/kernels`)
- **Logic:** Import `parseDirectoryStructure` and `findNodeByPath` from `src/utils/ui.ts`.
- **Action:** Parse the `snapshot.directoryStructure` into a tree. Traverse to the requested `path`. 
- **Return:** A flat JSON array of the immediate children at that node, indicating whether each is a `file` or `directory`.

### Tool 4: `find_references`
**Description:** Cross-file reference tracing for a specific symbol.
**Implementation:**
- **Input Schema:** `{ symbol: string }`
- **Logic:** Iterate through all files in `snapshot.files`. Use regex to locate where the exact `symbol` string is used.
- **Return:** A structured array. For each file containing the symbol, provide the `filePath`, the `line` numbers where it appears, and the exact string content of those lines to provide surrounding context.

---

## Acceptance Criteria & Constraints
1. **Zero Native C++ Bindings:** You must strictly use `jq-wasm`. Do not introduce `node-jq` or anything requiring `node-gyp`, as this breaks Termux/ARM compilation.
2. **Schema Compliance:** All new tools added to `serve.ts` must use the official `@modelcontextprotocol/sdk/types.js` schemas for registration (`ListToolsRequestSchema`, `CallToolRequestSchema`).
3. **Robust Error Handling:** The MCP server must not crash if an agent queries a non-existent file path, provides a bad `jq` syntax, or attempts to traverse a missing directory node. Return clean `McpError` objects.
4. **Testing Context:** Imagine the user is packing a complex Zig audio DSP repository (`github:user/sonic-dsp-kernel`) and querying specific `.zig` files via MCP. The `find_references` tool must cleanly parse non-JS languages, and the remote pack must handle the repository seamlessly. Ensure the code compiles via `npm run build` with zero TypeScript errors.

### Notes
* Update all documentation upon completion of development of feature; this includes `README.md`, `GEMINI.md`, `docs/jref.man`/`docs/jref.1`, and `jref.md`                                                                       
* Upon completion of development and updating documentation, commit all changes (with detailed message), and push to remote repo (Github).
