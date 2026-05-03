# `jref` Dev Plan [pt.1/3]

## Prompt

Now that we have some solid features established, we are going to work on refining them where they fall short (debugging), as well as adding/extending/enhancing upon these features.

### Feature Assessment and Enhancement Plan(s)

**repomix:**
- Added new dev dependancy, "Repomix" to assist with the "packing" of the codebases.
  - `repomix` is the project where the schema and packing capability are originally derived from; Now, with `repomix` installed in project (as dev dependancy), we are going to integrate `repomix`'s packing capabilities *directly* into the `jref` project, to help ensure functionality and compatibility, and to make it easier to extend functionality later.

**Piping Capability/Enhancements:**
- As of now, attempting to pack the codebase and pipe the json output directly to `jref ui` doesn't work/hits errors; We're going to ensure that this subcommand (and basically *all* others) are capable of handling piped input robustly.

**Add Additional Format Handling/Capabilities:**
- Introduce support for other JSON-based filetypes/syntaxes (i.e., JSON5, JSONC, JSON-LD, JSON-RPC 2.0, etc.), as well as other *new*data-types/languages, such as XML, YAML, TOML, etc.; Some of these data-types are already configured within `repomix`, so integration *should* be streamlined.

**Streaming/Memory Enhancements:**
- As of now, `jref` is only capable of handling relativeley small packed files, due to being suboptimal and/or design; We are going to research and implement libraries/optimizations to (*ideally*) be capable of handling files of up to 1GB (or more!) via streaming and memory enhancements.

**Schema Validation/Formatting:**
- We are going to develop/include robust "self-validating" capabilities to ensure data adherance, and "input-formatting" capabilities, to help *nudge* the data towards schema compliance, when necessary.

**Overall Program Extensibility:**
- Add API/"harness" to enable integration of "plugins", in which users/developers may create said plugins, consisting of, for example, new schemas, functionality, and data transformation/discovery.

**Enhanced `jref ui` Capabilities:**
- Refine and extend the functionality of the `jref ui` command to enhance user-based utility of overall program.
  - For example, adding capability to view files in user-selected program/pager, via either CLI flag and/or user env variable(s) (such as `$PAGER`, or even include new `$JREF_PAGER`).
  - Another example would be enhanced file search capabilities (i.e., searching for filename, as well as searching for strings *within* files).

**`jref inspect` Enhancements/Fixes:**
- Fix/refine the actions/executions of `jref inspect` with flags included.correct excecution of `jref inspect` with '-s' flag
  - As of now, `jref inspect -s {FILE}` gives almost identical output as `jref inspect {FILE}`; restrict '-s' flag to outputting *only* the ascii directory-tree.

**Enhance `jref extract`:**
- Optimize  ability to "rehydrate"/"unpack" files from packed codebase; "streamline" syntax/invocation of `jref extract` for "unpacking" one or many files, with ease.
  - Include `extract` capability within `jref ui`, for easy selection of multiple files for extracting/unpacking to local device/filesystem.

**Virtual Pipe Execution (`run`):**
- Execute a script directly from the JSON without extraction.
  - **Implementation:** `jref run --path scripts/db-migrate.ts snapshot.json`.
