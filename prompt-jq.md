# Promptt: Implement Global jq-wasm Middleware in jref
**Role:** You are an expert Node.js/TypeScript systems programmer. You are working on jref (JSON Reference CLI), a tool designed to manage multi-megabyte codebase snapshots in highly constrained environments (Android Termux, Raspberry Pi).
**Objective:** Integrate jq query language support into the CLI. You must use the jq-wasm npm package. **Do not use node-jq or any package requiring C++ node-gyp bindings**, as this breaks portability on our target ARM devices.
You will implement this as a **Global Middleware Flag (--jq <filter>)** that intercepts and reshapes the snapshot state in memory before any core command (like extract, inspect, or serve) receives it.
### Step 1: Dependency Management
 1. Install the jq-wasm package as a standard dependency: npm install jq-wasm.
### Step 2: Update Type Definitions
Target File: src/types/index.ts
 1. Locate the CLIOptions interface.
 2. Add a new optional property: jq?: string;
### Step 3: Implement the Global CLI Flag
Target File: src/index.ts
 1. Locate the parseGlobalOptions function.
 2. Add parsing logic to catch --jq or -q.
 3. If --jq or -q is found, extract the next array element as the filter string and assign it to options.jq.
 4. Locate the printGlobalHelp function and document the new global flags:
   --jq, -q <filter>   Apply a jq filter to reshape the snapshot before command execution
### Step 4: The Middleware Interception Logic
Target File: src/utils/streaming-json.ts
 1. Import jq from jq-wasm at the top of the file.
 2. Locate the parseJSON function. This function currently parses the file, falls back to translateSnapshot if needed, and strictly validates against ProjectSnapshotSchema.
 3. Inject the jq-wasm processing loop **after** the initial parse (or streaming process) completes, but **before** the ProjectSnapshotSchema validation.
 4. **Implementation details for the interception:**
   ```typescript
   // Example logic flow to implement:
   if (options?.jq) {  // Note: you may need to pass options down from the Command class or loadSnapshot signature
       try {
           snapshot = await jq.json(snapshot, options.jq);
       } catch (err) {
           throw new Error(`JQ Execution Failed: ${err.message}`);
       }
   }
   
   ```
 5. **CRITICAL EDGE CASE (Schema Drift):** If a user runs a destructive jq query (e.g., jref inspect --jq '.files | keys'), the resulting object will be an Array, which will immediately fail the ProjectSnapshotSchema.safeParse(snapshot) check that occurs right after.
   * **Your task:** Modify parseJSON (and its caller loadSnapshot if necessary) to handle this gracefully. If the --jq flag is active AND the resulting data fails the ProjectSnapshotSchema validation, the CLI should catch this. Instead of throwing a fatal error, it should assume the user wanted a raw data extraction. It should print the raw JSON output to process.stdout and immediately process.exit(0), bypassing the requested command entirely.
   * *If it DOES pass the schema check* (e.g., the user just filtered the files object but kept the root structure intact), it should proceed normally and return the ProjectSnapshot to the requested command.
### Step 5: Command Context Passing
Target File: src/utils/command.ts
 1. In the abstract Command class, locate the getSnapshot method.
 2. You will need to ensure that the global options object is passed down into the loadSnapshot function so that streaming-json.ts knows whether the --jq flag is active.
 3. Update the signatures of loadSnapshot and parseJSON across the codebase to accept the options?: CLIOptions parameter as needed.
### Acceptance Criteria
 * Running jref inspect --jq '.files |= with_entries(select(.key | endswith(".ts")))' snapshot.json successfully outputs an inspection of ONLY TypeScript files.
 * Running jref extract --jq '.files |= with_entries(select(.key | startswith("src/api/")))' snapshot.json successfully extracts only the API directory, because the snapshot was reshaped before extract processed it.
 * Running jref inspect --jq '.files | keys' snapshot.json outputs a raw JSON array of file paths to the terminal and exits cleanly with code 0, rather than crashing due to schema validation failure.
 * The project successfully builds (npm run build) with no TypeScript errors.
### Notes
 * Update all documentation upon completion of development of feature; this includes `README.md`, `GEMINI.md`, `docs/jref.man`/`docs/jref.1`, and `jref.md` 
 * Upon completion of development and updating documentation, commit all changes (with detailed message), and push to remote repo (Github).
