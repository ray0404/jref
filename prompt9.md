**Context:**
I am continuing development on `jref`, a Node.js/TypeScript CLI tool for interacting with JSON project snapshots. I have successfully integrated base binary handling: `jref` now supports `bpack`/`bextract` for standalone binary archives, and the standard `pack`/`extract` commands feature an `--include-binaries` flag to append Base64-encoded binary assets to the standard text-based LLM context payload. The `ProjectSnapshot` interface has been updated to track which files are Base64 encoded.

**The Objective:**
Now that binary data exists within the JSON snapshots, I need to robustly integrate binary-awareness across the rest of the `jref` CLI ecosystem. The goal is to safely view, inspect, filter, and handle binary assets in existing commands (`inspect`, `ui`, `diff`, `search`, `query`, `summarize`) without causing memory crashes, terminal flooding, or wasted LLM tokens.

**Architectural Directives & Command Enhancements:**

1. **`src/commands/inspect.ts` (Metadata & Sizing):**
   - Update the inspect command to parse the new encoding metadata.
   - Categorize output: Display a breakdown of "Source Files" vs. "Binary Assets".
   - **Crucial:** Calculate and display the *decoded* size of binary files (Base64 string length * 0.75), not the encoded string length.
   - Show a total aggregate size for text vs. binary payload.

2. **`src/commands/ui.ts` & `src/components/TUI.ts` (Safe Rendering):**
   - The Ink-based TUI must visually differentiate binary files in the file tree (e.g., using a different icon or chalk color).
   - **Safe Previewing:** Modify the file preview pane. If a user selects a binary file, DO NOT attempt to render the Base64 string. Instead, render a centered, styled placeholder block: `[ Binary Asset | <Filename> | <Decoded Size> ]`. Rendering massive Base64 strings in terminal UIs causes extreme lag and memory issues.

3. **`src/commands/search.ts` & `src/commands/query.ts` (Exclusion Logic):**
   - By default, text searches/queries MUST skip the content of files marked as binary. Attempting a regex match against a 10MB Base64 string is computationally wasteful and yields false positives.
   - Add a `--search-binaries` flag to override this behavior (useful if a user is searching for a specific Base64 signature), but default it to `false`.
   - Ensure the filename itself is still searchable, even if the content is skipped.

4. **`src/commands/diff.ts` (Binary Diffing):**
   - When diffing two snapshots, intercept binary files.
   - Do not run standard text diffing algorithms (like line-by-line diffs) on Base64 strings.
   - Instead, compute a fast hash (e.g., SHA-256 or MD5) of the Base64 strings. Report the diff as: `Binary file <path> changed (Size: <old> -> <new>)` or `Binary file <path> identical`.

5. **`src/commands/summarize.ts` (Token Optimization):**
   - When summarizing a project for LLM context, exclude the `data` payload of binary files. LLMs cannot inherently parse raw Base64 images or binaries via text.
   - Replace the binary payload with metadata strings in the LLM context, e.g., `<binary_asset name="logo.png" size="1.2MB" />`. This preserves the directory structure for the LLM without blowing out the token context window.

**Development Constraints:**
- Assume execution in memory-constrained, headless CLI environments. Prioritize stream-friendly parsing and avoid loading entire massive JSON bundles into memory simultaneously if possible.
- Avoid introducing interactive debug steps that require browser-based profiling or desktop GUI tools; handle debugging internally and print meaningful stderr messages on failure.
- Ensure all command flag parsing (using `argparse` patterns) accurately registers new flags without conflicting with existing shorthands.

**Output Generation:**
Please provide the updated TypeScript code for the affected command files (`inspect.ts`, `ui.ts`, `search.ts`, `diff.ts`, `summarize.ts`) and any corresponding UI component updates. Explain the hashing strategy used for `diff.ts` and the UI state management changes made for the Ink TUI.
