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
