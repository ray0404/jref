# JREF Knowledge Graph Report

## God Nodes (Most Central Symbols)
- **src/utils/command.ts** (Centrality: 0.07)
- **src/utils/streaming-json.ts** (Centrality: 0.05)
- **src/commands/reconstruct.ts** (Centrality: 0.05)
- **src/utils/output.ts** (Centrality: 0.05)
- **src/commands/extract.ts** (Centrality: 0.04)
- **src/commands/inspect.ts** (Centrality: 0.04)
- **src/commands/search.ts** (Centrality: 0.04)
- **src/types/index.ts** (Centrality: 0.04)
- **src/commands/diff.ts** (Centrality: 0.03)
- **src/commands/query.ts** (Centrality: 0.03)

## Modular Communities
### Community 0 (1 nodes)
- schemas/gemini-session-schema.json

### Community 1 (1 nodes)
- schemas/project-snapshot-schema.json

### Community 2 (1 nodes)
- schemas/tree-output-schema.json

### Community 3 (3 nodes)
- scripts/install-man.js
- scripts/install-man.js:function_declaration:getManDir
- scripts/install-man.js:function_declaration:main

### Community 4 (5 nodes)
- src/commands/bextract.ts
- src/commands/bextract.ts:interface_declaration:BExtractFlags
- src/commands/bextract.ts:class_declaration:BExtractCommand
- src/commands/bextract.ts:method_definition:execute
- src/commands/bextract.ts:method_definition:parseArgs

### Community 5 (5 nodes)
- src/commands/bpack.ts
- src/commands/bpack.ts:interface_declaration:BPackFlags
- src/commands/bpack.ts:class_declaration:BPackCommand
- src/commands/bpack.ts:method_definition:execute
- src/commands/bpack.ts:method_definition:parseArgs

### Community 6 (1 nodes)
- src/commands/diff.test.ts

### Community 7 (8 nodes)
- src/commands/diff.ts
- src/commands/diff.ts:class_declaration:DiffCommand
- src/commands/diff.ts:method_definition:execute
- src/commands/diff.ts:method_definition:computeHash
- src/commands/diff.ts:method_definition:findExtraFiles
- ... and 3 more

### Community 8 (1 nodes)
- src/commands/extract.test.ts

### Community 9 (9 nodes)
- src/commands/extract.ts
- src/commands/extract.ts:interface_declaration:ExtractFlags
- src/commands/extract.ts:class_declaration:ExtractCommand
- src/commands/extract.ts:method_definition:execute
- src/commands/extract.ts:method_definition:parseArgs
- ... and 4 more

### Community 10 (1 nodes)
- src/commands/inspect.test.ts

### Community 11 (9 nodes)
- src/commands/inspect.ts
- src/commands/inspect.ts:class_declaration:InspectCommand
- src/commands/inspect.ts:method_definition:execute
- src/commands/inspect.ts:method_definition:parseArgs
- src/commands/inspect.ts:method_definition:printMetadata
- ... and 4 more

### Community 12 (1 nodes)
- src/commands/pack.test.ts

### Community 13 (5 nodes)
- src/commands/pack.ts
- src/commands/pack.ts:interface_declaration:PackFlags
- src/commands/pack.ts:class_declaration:PackCommand
- src/commands/pack.ts:method_definition:execute
- src/commands/pack.ts:method_definition:parseArgs

### Community 14 (1 nodes)
- src/commands/patch.test.ts

### Community 15 (4 nodes)
- src/commands/patch.ts
- src/commands/patch.ts:class_declaration:PatchCommand
- src/commands/patch.ts:method_definition:execute
- src/commands/patch.ts:method_definition:parseArgs

### Community 16 (1 nodes)
- src/commands/query.test.ts

### Community 17 (8 nodes)
- src/commands/query.ts
- src/commands/query.ts:interface_declaration:QueryFlags
- src/commands/query.ts:class_declaration:QueryCommand
- src/commands/query.ts:method_definition:execute
- src/commands/query.ts:method_definition:parseArgs
- ... and 3 more

### Community 18 (11 nodes)
- src/commands/reconstruct.ts
- src/commands/reconstruct.ts:interface_declaration:ReconstructFlags
- src/commands/reconstruct.ts:class_declaration:ReconstructCommand
- src/commands/reconstruct.ts:method_definition:execute
- src/commands/reconstruct.ts:method_definition:parseArgs
- ... and 6 more

### Community 19 (6 nodes)
- src/commands/run.ts
- src/commands/run.ts:interface_declaration:RunFlags
- src/commands/run.ts:class_declaration:RunCommand
- src/commands/run.ts:method_definition:execute
- src/commands/run.ts:method_definition:parseArgs
- ... and 1 more

### Community 20 (1 nodes)
- src/commands/search.test.ts

### Community 21 (9 nodes)
- src/commands/search.ts
- src/commands/search.ts:interface_declaration:SearchFlags
- src/commands/search.ts:class_declaration:SearchCommand
- src/commands/search.ts:method_definition:execute
- src/commands/search.ts:method_definition:parseArgs
- ... and 4 more

### Community 22 (4 nodes)
- src/commands/serve.ts
- src/commands/serve.ts:class_declaration:ServeCommand
- src/commands/serve.ts:method_definition:execute
- src/commands/serve.ts:method_definition:parseArgs

### Community 23 (1 nodes)
- src/commands/summarize.test.ts

### Community 24 (5 nodes)
- src/commands/summarize.ts
- src/commands/summarize.ts:class_declaration:SummarizeCommand
- src/commands/summarize.ts:method_definition:execute
- src/commands/summarize.ts:method_definition:formatBytes
- src/commands/summarize.ts:method_definition:parseArgs

### Community 25 (1 nodes)
- src/commands/ui.test.ts

### Community 26 (6 nodes)
- src/commands/ui.ts
- src/commands/ui.ts:interface_declaration:UIFlags
- src/commands/ui.ts:class_declaration:UICommand
- src/commands/ui.ts:method_definition:execute
- src/commands/ui.ts:method_definition:parseArgs
- ... and 1 more

### Community 27 (1 nodes)
- src/components/TUI.test.ts

### Community 28 (6 nodes)
- src/components/TUI.ts
- src/components/TUI.ts:interface_declaration:SnapshotBrowserProps
- src/components/TUI.ts:interface_declaration:FlatTreeItem
- src/components/TUI.ts:function_declaration:buildFlatTree
- src/components/TUI.ts:function_declaration:traverse
- ... and 1 more

### Community 29 (6 nodes)
- src/plugins/openapi.ts
- src/plugins/openapi.ts:class_declaration:OpenAPICommand
- src/plugins/openapi.ts:method_definition:execute
- src/plugins/openapi.ts:method_definition:parseArgs
- src/plugins/openapi.ts:method_definition:translateToSnapshot
- ... and 1 more

### Community 30 (9 nodes)
- src/types/index.ts
- src/types/index.ts:interface_declaration:SearchResult
- src/types/index.ts:interface_declaration:SearchMatch
- src/types/index.ts:interface_declaration:ExtractOptions
- src/types/index.ts:interface_declaration:ReconstructResult
- ... and 4 more

### Community 31 (6 nodes)
- src/utils/binary.ts
- src/utils/binary.ts:function_declaration:isBinaryBuffer
- src/utils/binary.ts:function_declaration:isBinaryFile
- src/utils/binary.ts:function_declaration:getFileEncoding
- src/utils/binary.ts:function_declaration:decodeBase64
- ... and 1 more

### Community 32 (4 nodes)
- src/utils/command.test.ts
- src/utils/command.test.ts:class_declaration:TestCommand
- src/utils/command.test.ts:method_definition:execute
- src/utils/command.test.ts:method_definition:parseArgs

### Community 33 (17 nodes)
- src/utils/command.ts
- src/utils/command.ts:interface_declaration:CommandOption
- src/utils/command.ts:interface_declaration:CommandDefinition
- src/utils/command.ts:interface_declaration:JrefPlugin
- src/utils/command.ts:method_definition:getSnapshot
- ... and 12 more

### Community 34 (1 nodes)
- src/utils/format.test.ts

### Community 35 (5 nodes)
- src/utils/format.ts
- src/utils/format.ts:function_declaration:sniffFormat
- src/utils/format.ts:function_declaration:translateSnapshot
- src/utils/format.ts:function_declaration:parseRepomixXML
- src/utils/format.ts:function_declaration:stripImplementation

### Community 36 (5 nodes)
- src/utils/input.ts
- src/utils/input.ts:function_declaration:isStdinPiped
- src/utils/input.ts:function_declaration:readFromInput
- src/utils/input.ts:function_declaration:reestablishTTY
- src/utils/input.ts:function_declaration:readStdinSync

### Community 37 (2 nodes)
- src/utils/instruction.ts
- src/utils/instruction.ts:function_declaration:generateInstruction

### Community 38 (1 nodes)
- src/utils/output.test.ts

### Community 39 (11 nodes)
- src/utils/output.ts
- src/utils/output.ts:function_declaration:formatOutput
- src/utils/output.ts:function_declaration:printOutput
- src/utils/output.ts:function_declaration:printError
- src/utils/output.ts:function_declaration:printSuccess
- ... and 6 more

### Community 40 (1 nodes)
- src/utils/streaming-json.test.ts

### Community 41 (12 nodes)
- src/utils/streaming-json.ts
- src/utils/streaming-json.ts:function_declaration:parseJSON
- src/utils/streaming-json.ts:function_declaration:applyJQ
- src/utils/streaming-json.ts:function_declaration:processSnapshot
- src/utils/streaming-json.ts:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 42 (1 nodes)
- src/utils/ui.test.ts

### Community 43 (7 nodes)
- src/utils/ui.ts
- src/utils/ui.ts:interface_declaration:TreeNode
- src/utils/ui.ts:function_declaration:parseDirectoryStructure
- src/utils/ui.ts:function_declaration:parseTreeLine
- src/utils/ui.ts:function_declaration:getAllFilePaths
- ... and 2 more

### Community 44 (5 nodes)
- src/index.ts
- src/index.ts:function_declaration:parseGlobalOptions
- src/index.ts:function_declaration:printGlobalHelp
- src/index.ts:function_declaration:printVersion
- src/index.ts:function_declaration:main

### Community 45 (1 nodes)
- add_test_coverage.py

### Community 46 (1 nodes)
- get_file.py

### Community 47 (1 nodes)
- make_test.py

### Community 48 (1 nodes)
- package-lock.json

### Community 49 (1 nodes)
- package.json

### Community 50 (1 nodes)
- tsconfig.json

### Community 51 (1 nodes)
- vitest.config.ts

