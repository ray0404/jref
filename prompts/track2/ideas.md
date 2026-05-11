# `jref` Capabilities Brainstorm

Possible/perspective commands, features, capabilites, etc to consider development for/integrating into `jref`.

## Ideas List

**`jref alias`:** *COMPLETE*
- [x] Tool for ~~setting~~ up local/global `jref` aliases; similar in implementation to `git alias` command; should be capable of creating persistent and/or ephemeral aliases, and either local and/or global.

**`jref bin`/`jbin`:** *COMPLETE*
- [x] Dedicated comand that runs similar to `jref run` for running/excecuting scripts from directly within packed project snapshots, *but*, meant to run commands that exist within local and/or global `.jref/bin/` directories (and/or any other directory present in env variable `$JREF_BIN_PATH`.
- [x] `jref bin [FILE] [COMMAND/SCRIPT] [COMMAND ARGS]` or `jref bin [FILE] [COMMAND/SCRIPT] -- [COMMAND ARGS]` where `--` explicitly marks end of jref command and begining of ARGS for command being run.
- [x] Implemented as `jbin` via `jref alias`.
  - **Example:** `jbin DSP analyze` would attempt to read a file named `DSP` or `DSP.json` that is present in either local and/or global `.jref/bin/` directory, or any other dir explicitly within `$JREF_BIN_PATH`; command/file/script being run from `DSP` or `DSP.json` would be `analyze.*` or `analyze` within the `DSP` snapshot.

**`jref git`/`jgit`:** *COMPLETE*
- [x] dedicated tool/command for traversing, analyzing, updating/mutating, or any other git capable function.
- [x] Should include new/revised UI for "interactive" git repo modifaction/processing, as well as json (and possibly YAML, TOML, and/or XML) stdout and/or stdout-piping capabilities (possible for things like scripting/automation).

**`jref tool`/`jtool`:** *COMPLETE*
- [x] Bulk integration of additional and/or "standard" CLI tools, meant for `jref`/json processing of various CLI tool inputs and/or outputs, with built-in integration (or easily extensible integration) of *custom* tool UI's through/via the `jref tool` command.
  - Possibly look into CLI tool `jc` for prospective "integration points" of/for integrating popular CLI tools into `jref`.

**`jref config`:** *COMPLETE*
- [x] Introduce entire env configuration capabilities, for things like preferences, jref-specific env variables, jref aliases, etc.. 
- [x] Should be implemented via local/global `.jref/config` or `.jref/config.json` configuration file, and should also enable interactive toggling/setting of local/global/file-specified configurations (either as a `--config` flag for `jref ui` and/or a ``--ui` flag for `jref config`)

> This is a test for glow and bat. is it multi-line, or single? if single, does it wrap? would it  depend on the reader/medium the text is printed?

    This is another test for `glow` and for `bat`.


```json
{
  "test": {
    "status": true,
    "path": "some/file/path.txt"
    },
}
```

### Notes

- The capabilities outlined in "*Ideas List*" are *rough*/"brainstormed" ideas and have not been fully fleshed-out.
- The details for each item in the "*Ideas List*" are "suggestions" and/or *loose* descriptions of *possible* commands; additional research and architechtural designing are likeley needed for development of *complete*/"functional" dev prompts and/or feature `blueprint.md` file(s).
