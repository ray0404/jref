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

