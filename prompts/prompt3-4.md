# `jrev` Dev Plan [pt.2/3]

## System Context & Developer Profile
You are an expert Node.js and TypeScript developer, assisting in the development of `jref`, a CLI tool for interacting with condensed JSON project snapshots. Use any available skills, tool_calls, and MCP servers that may be useful/beneficial to you for the development of the features below.

**Communication Guidelines:**
When explaining concepts, architectural decisions, or code logic, assume my knowledge is roughly equivalent to a Computer Science major about 2-3 years into their degree. Err on the side of higher verbosity and thorough explanations rather than brevity. Always perform internal debugging and self-correction before providing a response to minimize back-and-forth iteration. 

**Target Environment:**
I frequently work in a Termux CLI environment on a Galaxy S25 Ultra, as well as on headless Raspberry Pi 4 clusters and various Linux distros. 
* Keep mobile-centric, constrained-memory constraints in mind.
* Note that developer tools/browser windows are borderline inaccessible in my Termux environment. Avoid requesting me to add code for debugging output to the console; rely on automated testing or internal file-logging debugging methods instead.
* The path to binaries in the Termux environment is `/data/data/com.termux/files/usr/bin`.

## The Mission
The current project is `jref`; We are going to refine existing features, debug known issues, and aggressively extend the tool's capabilities.
Please review the following task list and let me know how you would approach implementing them. We will execute these step-by-step.

### Feature Enhancement Plan

#### 1. Repomix Integration (Packing)
* **Goal:** We recently added `repomix` as a dev dependency. Instead of our custom file-walking logic in `src/commands/pack.ts`, integrate `repomix`'s programmatic API directly into the `jref pack` command.
* **Requirements:** Ensure it maintains our current `.gitignore` compliance and output schema format, but leverages `repomix` for robust packing.

#### 2. Piping Capability/Enhancements (The TUI Stdin Issue)
* **Goal:** Ensure all subcommands can robustly handle piped input. Specifically, piping a snapshot to the UI (`cat snapshot.json | jref ui`) currently fails.
* **Technical Hint:** The issue likely stems from `ink` (the React TUI library) needing a TTY for interactive keypresses. When `stdin` is piped, it consumes the pipe for data and loses the TTY. You will need to implement a solution that reads the piped data entirely, then cleanly reconnects `stdin` to `/dev/tty` (or the OS equivalent) before mounting the `ink` app.

#### 3. Additional Format Handling
* **Goal:** Introduce support for parsing and emitting other data-types/languages natively.
* **Targets:** JSON5, JSONC, JSON-LD, JSON-RPC 2.0, XML, YAML, and TOML.
* **Requirements:** Integrate these parsers efficiently (some are already configured within Repomix). `jref` should be able to detect the format and translate it into our internal snapshot representation.

#### 4. Streaming & Memory Enhancements (1GB+ Support)
* **Goal:** `jref` currently chokes on massive files. `src/utils/streaming-json.ts` currently has an 8MB buffer max, after which it relies on a naive chunked string concatenation that will eventually OOM on low-memory devices (like a Raspberry Pi 4).
* **Requirements:** Research and implement true stream-processing libraries (e.g., `stream-json` or a custom SAX-like parser) to handle parsing JSON snapshots up to 1GB+ in size without exhausting the V8 heap.

#### 5. Schema Validation & Formatting
* **Goal:** Develop robust self-validating and input-formatting capabilities.
* **Requirements:** Ensure incoming data adheres strictly to our snapshot schema. If it deviates slightly, implement formatting logic to "nudge" or coerce the data into compliance where safe to do so. (Consider integrating libraries like `zod` or `ajv`).

#### 6. Program Extensibility (Plugin API)
* **Goal:** Create a plugin harness/API.
* **Requirements:** Allow users to write external plugins that can introduce new commands, new file format schemas, or custom data transformation/discovery pipelines. Extend `src/utils/command.ts` to support dynamic loading of these plugins.

#### 7. Enhanced `jref ui` Capabilities
* **Goal:** Refine the interactive TUI.
* **Requirements:**
    1.  **Pager Support:** Allow users to view files in their preferred pager. Support standard environment variables (`$PAGER`) and a custom `$JREF_PAGER`.
    2.  **Deep Search:** Enhance search to include strings *within* files, not just filenames.
    3.  **UI Extraction:** Add a keybind in the UI to seamlessly extract the currently selected file (or multiple selected files) directly to the local filesystem without needing to exit the TUI.

#### 8. `jref inspect` Debugging
* **Goal:** Fix the `-s` flag collision.
* **Technical Hint:** Currently, `jref inspect -s {FILE}` outputs almost the entire file instead of just the structure. Check `src/index.ts` where `-s` is globally mapped to `--silent`. The `inspect` command is trying to use `-s` for `--structure`. Resolve this collision so `inspect --structure` (or a newly assigned short flag) outputs *only* the ASCII directory tree.

#### 9. Enhanced `jref extract`
* **Goal:** Streamline the syntax and invocation for unpacking files.
* **Requirements:** Make it incredibly ergonomic to unpack a single file, a specific directory, or an array of files via CLI arguments.

#### 10. Virtual Pipe Execution (`jref run`)
* **Goal:** Execute a script directly from the JSON snapshot *without* permanent extraction.
* **Requirements:** Implement `jref run --path scripts/db-migrate.ts snapshot.json`.
* **Implementation Idea:** Extract the target file (and any strict local dependencies) into `os.tmpdir()` (or Termux's equivalent temp directory), execute it using `child_process.spawn`, capture the output, and clean up the temp files immediately after execution.

**Action Required:**
- Acknowledge these instructions and provide a high-level architectural plan for how we should sequence these 10 tasks to avoid merge 
conflicts and overlapping refactors.
- Once a plan is constructed, begin sequential ("test-driven") development of the features listed above (in this prompt/file), 
ensuring each feature is functional, debugged, robust, and builds, before considering feature-development done and movind on to the next feature.
- After development, testing, and build verification of each feature on the list, be sure to git add, commit (with detailed message), 
and push changes to respective github remote (and branch, if on dev branch/worktree). 
- Once development of all features on the list is concluded, and each feature has been tested and build-verified, update project 
documentation to reflect the new changes (project README.md, `man` documentation, and the markdown "`jref` CLI 
Reference"--docs/jref.man and docs/jref.md respectiveley).
- Upon recieving this prompt, excecute feature/codebase development as outlined to completion, without requesting/prompting the user 
(me) for input, *at least* until development of all features, is complete, and changes have been documented and pushed to github.
- Once development is complete, deliver a final `development-report.md` file, giving a high-level report/summary of the features 
addedd, and how they were developed/implemented.
# `jref` Dev Plan [pt.3/3]

## Architectural Sequencing Strategy
To prevent merge conflicts, regression loops, and overlapping refactors, the development must be sequenced by foundational dependencies. We will tackle memory and data-flow first, schema validation second, and user-facing commands last.
| Phase | Focus Area | Tasks Addressed | Rationale |
|---|---|---|---|
| **Phase 1** | **Core Plumbing & Memory** | 8 (inspect fix), 4 (Streaming), 2 (TUI Stdin) | Fixes immediate CLI collisions and establishes the heavy-duty data pipelines required before we introduce new formats. |
| **Phase 2** | **Data Integrity & Formats** | 5 (Schema Validation), 3 (Format Handling) | Introduces strict validation (Zod) and format translation layers. This ensures all downstream commands operate on a guaranteed internal AST. |
| **Phase 3** | **Extraction & Execution** | 9 (extract UX), 10 (run Command) | Expands the utility of the data once the core is stable. The run command will rely heavily on robust temporary file management. |
| **Phase 4** | **Packing & TUI Expansion** | 1 (Repomix), 7 (TUI Enhancements) | Swaps out the custom packer for repomix and heavily extends the ink React application. |
| **Phase 5** | **Ecosystem Extensibility** | 6 (Plugin API) | Introduces dynamic loading. Built last to ensure the core API it exposes is finalized and stable. |
## Detailed Implementation Plan
### Phase 1: Core Plumbing & Memory Foundations
**Task 8: jref inspect Debugging**
 * **The Issue:** src/index.ts intercepts -s for --silent globally, stripping it from args before src/commands/inspect.ts can read it as --structure.
 * **Execution:** Modify src/commands/inspect.ts to alias --structure to -t (tree) instead of -s. Update the documentation and inspect.test.ts to reflect this change.
**Task 4: Streaming & Memory Enhancements (1GB+ Support)**
 * **The Issue:** The current implementation in src/utils/streaming-json.ts falls back to chunked string concatenation, which builds massive contiguous strings in the V8 heap, guaranteeing an Out-Of-Memory (OOM) crash on constrained devices.
 * **Execution:** 1. Introduce stream-json (a SAX-like JSON parser for Node.js).
   2. Rewrite loadSnapshotStreaming to pipe fs.createReadStream through stream-json's parser.
   3. Implement a custom stream assembler that listens for specific object keys (directoryStructure, files). Instead of loading all files into a single massive JS object, stream file contents directly to their intended targets (or yield them via async iterators) to maintain a flat memory profile.
**Task 2: Piping Capability (The TUI Stdin Issue)**
 * **The Issue:** Piped data (cat file | jref ui) consumes the standard input stream. The ink TUI requires a TTY (controlling terminal) to capture raw keystrokes (like arrow keys).
 * **Execution:** 1. In src/utils/input.ts, buffer the entirety of the piped data first.
   2. Once the pipe emits end, cleanly destroy the read stream.
   3. Manually re-establish the controlling terminal. On Linux/Termux, this is done by explicitly opening /dev/tty: process.stdin = fs.createReadStream('/dev/tty'). Ensure process.stdin.setRawMode(true) is re-applied before ink mounts.
### Phase 2: Data Integrity & Formats
**Task 5: Schema Validation & Formatting**
 * **The Issue:** jref assumes the parsed JSON perfectly matches the TypeScript interfaces, which is dangerous for external inputs.
 * **Execution:** 1. Introduce zod as a dependency.
   2. Define a strict Zod schema for ProjectSnapshot in src/types/index.ts.
   3. In the SAX-parser assembler (from Task 4), pipe the final assembled object through .safeParse().
   4. Write coercion logic: if directoryStructure is missing but files exists, automatically generate the ASCII tree internally before passing the object to the command layer.
**Task 3: Additional Format Handling**
 * **The Issue:** Hardcoded for strict JSON.
 * **Execution:** 1. Create a format-sniffer utility that reads the file extension or the first few bytes of the file/stream.
   2. Integrate yaml and @iarna/toml for alternative parsing.
   3. Map incoming data from JSONC, JSON5, YAML, or TOML into the strictly validated Zod schema. If the input is a Repomix XML output, write a specific adapter to parse the XML nodes into the jref files/directory structure.
### Phase 3: Extraction & Execution
**Task 9: Enhanced jref extract**
 * **The Issue:** The syntax requires --paths, which is clunky.
 * **Execution:** Refactor src/commands/extract.ts argument parsing. Allow positional arguments after the snapshot file. Support wildcards using a library like micromatch.
 * *Example target syntax:* jref extract snapshot.json src/**/*.ts.
**Task 10: Virtual Pipe Execution (jref run)**
 * **The Issue:** Running code trapped in a JSON file requires manual extraction and cleanup.
 * **Execution:** 1. Create src/commands/run.ts.
   2. Utilize os.tmpdir() to create a uniquely hashed temporary directory.
   3. Extract the target execution file and any explicitly requested dependencies to this directory.
   4. Spawn a child process. Be mindful of absolute binary paths. Ensure compatibility with /data/data/com.termux/files/usr/bin/env for script shebangs.
   5. Attach stdio: 'inherit' to proxy the output to the user.
   6. Implement a robust try/finally block and process.on('SIGINT') trap to ensure the temporary directory is recursively deleted regardless of how the script exits.
### Phase 4: Packing & TUI Expansion
**Task 1: Repomix Integration (Packing)**
 * **The Issue:** Custom recursive file-walking is reinventing the wheel and lacks standard robust ignore-handling.
 * **Execution:** 1. Move repomix to standard dependencies if it will be used at runtime.
   2. Refactor src/commands/pack.ts to call the repomix programmatic API.
   3. Capture the output, map it to the ProjectSnapshot Zod schema, and serialize it. Ensure .gitignore compliance remains intact by explicitly passing those rules into the Repomix configuration object.
**Task 7: Enhanced jref ui Capabilities**
 * **Execution:**
   1. **Pager Support:** In src/components/TUI.ts, update the e (edit) logic to also support a v (view) keybind. Spawn a child process using process.env.JREF_PAGER || process.env.PAGER || 'less'.
   2. **Deep Search:** Add a toggle in the UI search state (e.g., press Tab to switch between "File Name" and "File Content" search). Wire this to the existing logic in src/commands/search.ts.
   3. **UI Extraction:** Add an x keybind. When pressed, invoke the extractFiles utility to write the currently focused node to process.cwd(). Display an ink flash message upon success.
### Phase 5: Ecosystem Extensibility
**Task 6: Program Extensibility (Plugin API)**
 * **The Issue:** Monolithic command registry.
 * **Execution:** 1. Define a JrefPlugin interface requiring a name, version, and register(registry: CommandRegistry) method.
   2. Update src/index.ts to scan a local .jref/plugins directory or a specific jref.config.json array.
   3. Use dynamic import() to load these modules at runtime. Inject the CommandRegistry context into the plugin so it can register custom instances of the Command abstract class.
   4. Ensure the Vitest suite mocks dynamic imports to verify the registry properly accepts or rejects malformed plugins.

