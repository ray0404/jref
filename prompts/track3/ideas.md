# `jref` Feature Additions/Ideas

## Existing Functions

Revising, optimizing, adapting, debugging, etc., existing commands in order to enhance/refine *overall*functionality of the `jref` project/program.

**Universal `jref get`/`set`:**
- Do not restrict the functionality of `jref get` and `jref set` to *only* inputs/outputs that follow the jref project snapshot schema; expand this commands capabilities to all *valid* json syntax, input/output.
  - **Priority:** `HIGH`
  - **Status:** `PLANNED`

**Expand/revise `jref git` Functionality:**
- As of now, the `jref git` implementation is *somewhat* functional (supports few, basic `git`commands), and *far* from "robust"; Research and plan for updates for this feature/command, aiming to enhance this feature to operate on the same level of functionality and user experience as a tool like `lazygit`.
  - Look at/enhance the integration/hooks regarding `git`, as well as UI/UX enhancements overall ("TUI").
  - **Priority:** `MEDIUM`
  - **Status:** `PLANNEED`

**Debug `jref mount` Command:**
- This command *overall* doesn't seem to work almost "at all"; hard to be specific with issue, as the command breaks and exits nearly immediatly upon invocation.
  - **Priority:** `LOW`
  - **Status:** `PLANNED`

**Expand `jref serve` Command/Capabilities:**
- Expand/revise the functionality of `jref serve`, essentially adding/defining (*at least*) two to three ways to configure as MCP/four ways to be "utilized" by AI agents/MCP clients.
- The way `jref serve` should work is as follows:
  - `jref serve`: *without* a project-snapshot or AST-graph-snapshot should expose all `jref` tools, and *allow* the use of `jref` for any/general task or use, *and* should allow agent to create AST-graph and/or project-snapshot of current project and "load" that into its context, at which point, would be like running jref as `jref serve project-snapshot.json` or `jref serve graph-snapshot.json`.
  - `jref serve graph-snapshot.json` or `jref serve project-snapshot.json`: this MCP configuration should expose all `jref` tools, as prior example, *but* this variation proceeds to "load" either a "project-snapshot" or a "graph-snapshot" (AST-graph) of the current (or *other*) project immediatly upon initialization.
- `jref serve` should expose all of `jref`'s tools, capabilities, and subcommands (and them some) to the MCP client; must be updated to reflect *entire* list of `jref` commands, subcommands, and args/options, as well as context documentation on how to use them (effectiveley).
  - Other MCP features to develop/integrate include custom prompts (pre-configured commands) and workflows (use-cases/solutions refernces), custom scripts for "AI-specific" high-level usage of `jref`, or *integration* of `jref` with other tools, etc.. 
  - **Priority:** `HIGH`
  - **Status:** `PLANNED`
