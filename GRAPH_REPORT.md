# JREF Knowledge Graph Report

## God Nodes (Most Central Symbols)
- **src/utils/webdav-vfs.ts** (Centrality: 0.04)
- **src/utils/command.ts** (Centrality: 0.04)
- **src/commands/extract.ts** (Centrality: 0.02)
- **src/utils/output.ts** (Centrality: 0.02)
- **src/utils/streaming-json.ts** (Centrality: 0.02)
- **src/commands/reconstruct.ts** (Centrality: 0.02)
- **src/commands/config.ts** (Centrality: 0.02)
- **src/commands/graph.ts** (Centrality: 0.02)
- **src/commands/query.ts** (Centrality: 0.02)
- **src/types/index.ts** (Centrality: 0.02)

## Modular Communities
### Community 0 (1 nodes)
- schemas/tree-output-schema.json

### Community 1 (1 nodes)
- schemas/project-snapshot-schema.json

### Community 2 (1 nodes)
- schemas/repomix-default-config.json

### Community 3 (1 nodes)
- schemas/development-blueprint-schema.json

### Community 4 (1 nodes)
- schemas/ideas-schema1.json

### Community 5 (1 nodes)
- schemas/ideas-schema2.json

### Community 6 (1 nodes)
- schemas/repomix-config-schema.json

### Community 7 (1 nodes)
- schemas/graph-snapshot-schema.json

### Community 8 (1 nodes)
- schemas/gemini-session-schema.json

### Community 9 (1 nodes)
- src/commands/alias.test.ts

### Community 10 (4 nodes)
- src/commands/alias.ts
- src/commands/alias.ts:class_declaration:AliasCommand
- src/commands/alias.ts:method_definition:execute
- src/commands/alias.ts:method_definition:parseArgs

### Community 11 (5 nodes)
- src/commands/bin-setup.ts
- src/commands/bin-setup.ts:class_declaration:BinSetupCommand
- src/commands/bin-setup.ts:method_definition:execute
- src/commands/bin-setup.ts:method_definition:parseArgs
- src/commands/bin-setup.ts:method_definition:getSystemBinPath

### Community 12 (5 nodes)
- src/commands/bextract.ts
- src/commands/bextract.ts:interface_declaration:BExtractFlags
- src/commands/bextract.ts:class_declaration:BExtractCommand
- src/commands/bextract.ts:method_definition:execute
- src/commands/bextract.ts:method_definition:parseArgs

### Community 13 (1 nodes)
- src/commands/bextract.test.ts

### Community 14 (6 nodes)
- src/commands/bin.ts
- src/commands/bin.ts:class_declaration:BinCommand
- src/commands/bin.ts:method_definition:execute
- src/commands/bin.ts:method_definition:parseArgs
- src/commands/bin.ts:method_definition:resolveSnapshotFile
- ... and 1 more

### Community 15 (10 nodes)
- src/commands/config.ts
- src/commands/config.ts:class_declaration:ConfigCommand
- src/commands/config.ts:method_definition:execute
- src/commands/config.ts:method_definition:parseArgs
- src/commands/config.ts:method_definition:runUI
- ... and 5 more

### Community 16 (5 nodes)
- src/commands/bpack.ts
- src/commands/bpack.ts:interface_declaration:BPackFlags
- src/commands/bpack.ts:class_declaration:BPackCommand
- src/commands/bpack.ts:method_definition:execute
- src/commands/bpack.ts:method_definition:parseArgs

### Community 17 (1 nodes)
- src/commands/bin.test.ts

### Community 18 (1 nodes)
- src/commands/config.test.ts

### Community 19 (1 nodes)
- src/commands/diff.test.ts

### Community 20 (1 nodes)
- src/commands/extract.test.ts

### Community 21 (8 nodes)
- src/commands/diff.ts
- src/commands/diff.ts:class_declaration:DiffCommand
- src/commands/diff.ts:method_definition:execute
- src/commands/diff.ts:method_definition:computeHash
- src/commands/diff.ts:method_definition:findExtraFiles
- ... and 3 more

### Community 22 (12 nodes)
- src/commands/extract.ts
- src/commands/extract.ts:interface_declaration:ExtractFlags
- src/commands/extract.ts:class_declaration:ExtractCommand
- src/commands/extract.ts:method_definition:execute
- src/commands/extract.ts:method_definition:parseArgs
- ... and 7 more

### Community 23 (4 nodes)
- src/commands/get.ts
- src/commands/get.ts:class_declaration:GetCommand
- src/commands/get.ts:method_definition:execute
- src/commands/get.ts:method_definition:parseArgs

### Community 24 (4 nodes)
- src/commands/flatten.ts
- src/commands/flatten.ts:class_declaration:FlattenCommand
- src/commands/flatten.ts:method_definition:execute
- src/commands/flatten.ts:method_definition:parseArgs

### Community 25 (1 nodes)
- src/commands/get.test.ts

### Community 26 (1 nodes)
- src/commands/git.test.ts

### Community 27 (6 nodes)
- src/commands/git.ts
- src/commands/git.ts:interface_declaration:GitFlags
- src/commands/git.ts:class_declaration:GitCommand
- src/commands/git.ts:method_definition:execute
- src/commands/git.ts:method_definition:parseArgs
- ... and 1 more

### Community 28 (1 nodes)
- src/commands/graph.test.ts

### Community 29 (10 nodes)
- src/commands/graph.ts
- src/commands/graph.ts:class_declaration:GraphCommand
- src/commands/graph.ts:method_definition:parseArgs
- src/commands/graph.ts:method_definition:execute
- src/commands/graph.ts:method_definition:updateWasm
- ... and 5 more

### Community 30 (1 nodes)
- src/commands/inspect.test.ts

### Community 31 (9 nodes)
- src/commands/inspect.ts
- src/commands/inspect.ts:class_declaration:InspectCommand
- src/commands/inspect.ts:method_definition:execute
- src/commands/inspect.ts:method_definition:parseArgs
- src/commands/inspect.ts:method_definition:printMetadata
- ... and 4 more

### Community 32 (1 nodes)
- src/commands/mount.test.ts

### Community 33 (4 nodes)
- src/commands/mount.ts
- src/commands/mount.ts:class_declaration:MountCommand
- src/commands/mount.ts:method_definition:execute
- src/commands/mount.ts:method_definition:parseArgs

### Community 34 (1 nodes)
- src/commands/pack.test.ts

### Community 35 (5 nodes)
- src/commands/pack.ts
- src/commands/pack.ts:interface_declaration:PackFlags
- src/commands/pack.ts:class_declaration:PackCommand
- src/commands/pack.ts:method_definition:execute
- src/commands/pack.ts:method_definition:parseArgs

### Community 36 (1 nodes)
- src/commands/patch.test.ts

### Community 37 (4 nodes)
- src/commands/patch.ts
- src/commands/patch.ts:class_declaration:PatchCommand
- src/commands/patch.ts:method_definition:execute
- src/commands/patch.ts:method_definition:parseArgs

### Community 38 (1 nodes)
- src/commands/query.test.ts

### Community 39 (10 nodes)
- src/commands/query.ts
- src/commands/query.ts:interface_declaration:QueryFlags
- src/commands/query.ts:class_declaration:QueryCommand
- src/commands/query.ts:method_definition:execute
- src/commands/query.ts:method_definition:parseArgs
- ... and 5 more

### Community 40 (11 nodes)
- src/commands/reconstruct.ts
- src/commands/reconstruct.ts:interface_declaration:ReconstructFlags
- src/commands/reconstruct.ts:class_declaration:ReconstructCommand
- src/commands/reconstruct.ts:method_definition:execute
- src/commands/reconstruct.ts:method_definition:parseArgs
- ... and 6 more

### Community 41 (6 nodes)
- src/commands/run.ts
- src/commands/run.ts:interface_declaration:RunFlags
- src/commands/run.ts:class_declaration:RunCommand
- src/commands/run.ts:method_definition:execute
- src/commands/run.ts:method_definition:parseArgs
- ... and 1 more

### Community 42 (1 nodes)
- src/commands/search.test.ts

### Community 43 (1 nodes)
- src/commands/semantic.test.ts

### Community 44 (7 nodes)
- src/commands/serve.ts
- src/commands/serve.ts:class_declaration:ServeCommand
- src/commands/serve.ts:method_definition:execute
- src/commands/serve.ts:method_definition:handleLoadSnapshot
- src/commands/serve.ts:method_definition:handleDynamicCommand
- ... and 2 more

### Community 45 (9 nodes)
- src/commands/search.ts
- src/commands/search.ts:interface_declaration:SearchFlags
- src/commands/search.ts:class_declaration:SearchCommand
- src/commands/search.ts:method_definition:execute
- src/commands/search.ts:method_definition:parseArgs
- ... and 4 more

### Community 46 (1 nodes)
- src/commands/set.test.ts

### Community 47 (2 nodes)
- src/commands/shell.test.ts
- src/commands/shell.test.ts:method_definition:constructor

### Community 48 (5 nodes)
- src/commands/summarize.ts
- src/commands/summarize.ts:class_declaration:SummarizeCommand
- src/commands/summarize.ts:method_definition:execute
- src/commands/summarize.ts:method_definition:formatBytes
- src/commands/summarize.ts:method_definition:parseArgs

### Community 49 (1 nodes)
- src/commands/tool.test.ts

### Community 50 (1 nodes)
- src/commands/summarize.test.ts

### Community 51 (1 nodes)
- src/commands/ui.test.ts

### Community 52 (6 nodes)
- src/commands/shell.ts
- src/commands/shell.ts:class_declaration:ShellCommand
- src/commands/shell.ts:method_definition:execute
- src/commands/shell.ts:method_definition:createCustomEval
- src/commands/shell.ts:method_definition:isRecoverableError
- ... and 1 more

### Community 53 (5 nodes)
- src/commands/tool.ts
- src/commands/tool.ts:class_declaration:ToolCommand
- src/commands/tool.ts:method_definition:execute
- src/commands/tool.ts:method_definition:parseArgs
- src/commands/tool.ts:method_definition:logDebug

### Community 54 (6 nodes)
- src/commands/ui.ts
- src/commands/ui.ts:interface_declaration:UIFlags
- src/commands/ui.ts:class_declaration:UICommand
- src/commands/ui.ts:method_definition:execute
- src/commands/ui.ts:method_definition:parseArgs
- ... and 1 more

### Community 55 (1 nodes)
- src/commands/sync.test.ts

### Community 56 (4 nodes)
- src/commands/set.ts
- src/commands/set.ts:class_declaration:SetCommand
- src/commands/set.ts:method_definition:execute
- src/commands/set.ts:method_definition:parseArgs

### Community 57 (4 nodes)
- src/commands/unflatten.ts
- src/commands/unflatten.ts:class_declaration:UnflattenCommand
- src/commands/unflatten.ts:method_definition:execute
- src/commands/unflatten.ts:method_definition:parseArgs

### Community 58 (1 nodes)
- src/commands/validate.test.ts

### Community 59 (1 nodes)
- src/components/GitUI.test.ts

### Community 60 (6 nodes)
- src/components/TUI.ts
- src/components/TUI.ts:interface_declaration:SnapshotBrowserProps
- src/components/TUI.ts:interface_declaration:FlatTreeItem
- src/components/TUI.ts:function_declaration:buildFlatTree
- src/components/TUI.ts:function_declaration:traverse
- ... and 1 more

### Community 61 (5 nodes)
- src/components/GitUI.ts
- src/components/GitUI.ts:interface_declaration:GitUIProps
- src/components/GitUI.ts:interface_declaration:GitFileStatus
- src/components/GitUI.ts:function_declaration:GitUI
- src/components/GitUI.ts:function_declaration:loadDiff

### Community 62 (3 nodes)
- src/components/ConfigUI.ts
- src/components/ConfigUI.ts:interface_declaration:ConfigUIProps
- src/components/ConfigUI.ts:function_declaration:ConfigUI

### Community 63 (1 nodes)
- src/components/TUI.test.ts

### Community 64 (1 nodes)
- src/parsers/ls.ts

### Community 65 (1 nodes)
- src/utils/alias.test.ts

### Community 66 (8 nodes)
- src/parsers/index.ts
- src/parsers/index.ts:interface_declaration:ParserContext
- src/parsers/index.ts:interface_declaration:Parser
- src/parsers/index.ts:class_declaration:ParserRegistry
- src/parsers/index.ts:method_definition:register
- ... and 3 more

### Community 67 (8 nodes)
- src/utils/binary.ts
- src/utils/binary.ts:function_declaration:isBinaryBuffer
- src/utils/binary.ts:function_declaration:isBinaryFile
- src/utils/binary.ts:function_declaration:getFileEncoding
- src/utils/binary.ts:function_declaration:decodeBase64
- ... and 3 more

### Community 68 (6 nodes)
- src/plugins/openapi.ts
- src/plugins/openapi.ts:class_declaration:OpenAPICommand
- src/plugins/openapi.ts:method_definition:execute
- src/plugins/openapi.ts:method_definition:parseArgs
- src/plugins/openapi.ts:method_definition:translateToSnapshot
- ... and 1 more

### Community 69 (1 nodes)
- src/utils/binary.test.ts

### Community 70 (8 nodes)
- src/commands/validate.ts
- src/commands/validate.ts:interface_declaration:ValidateFlags
- src/commands/validate.ts:class_declaration:ValidateCommand
- src/commands/validate.ts:method_definition:execute
- src/commands/validate.ts:method_definition:getChangedFiles
- ... and 3 more

### Community 71 (10 nodes)
- src/types/index.ts
- src/types/index.ts:interface_declaration:CodeChunk
- src/types/index.ts:interface_declaration:SearchResult
- src/types/index.ts:interface_declaration:SearchMatch
- src/types/index.ts:interface_declaration:ExtractOptions
- ... and 5 more

### Community 72 (1 nodes)
- src/plugins/openapi.test.ts

### Community 73 (5 nodes)
- src/utils/alias.ts
- src/utils/alias.ts:function_declaration:logDebug
- src/utils/alias.ts:function_declaration:loadAliasConfig
- src/utils/alias.ts:function_declaration:saveAliasConfig
- src/utils/alias.ts:function_declaration:expandAliases

### Community 74 (4 nodes)
- src/utils/command.test.ts
- src/utils/command.test.ts:class_declaration:TestCommand
- src/utils/command.test.ts:method_definition:execute
- src/utils/command.test.ts:method_definition:parseArgs

### Community 75 (1 nodes)
- src/utils/chunking.test.ts

### Community 76 (18 nodes)
- src/utils/command.ts
- src/utils/command.ts:interface_declaration:CommandOption
- src/utils/command.ts:interface_declaration:CommandDefinition
- src/utils/command.ts:interface_declaration:JrefPlugin
- src/utils/command.ts:method_definition:getJSON
- ... and 13 more

### Community 77 (6 nodes)
- src/utils/chunking.ts
- src/utils/chunking.ts:interface_declaration:LanguagePattern
- src/utils/chunking.ts:function_declaration:findBlockEnd
- src/utils/chunking.ts:function_declaration:chunkCode
- src/utils/chunking.ts:function_declaration:findPythonBlockEnd
- ... and 1 more

### Community 78 (6 nodes)
- src/utils/dependency.ts
- src/utils/dependency.ts:interface_declaration:DependencyGraph
- src/utils/dependency.ts:function_declaration:buildDependentGraph
- src/utils/dependency.ts:function_declaration:getImports
- src/utils/dependency.ts:function_declaration:resolveImport
- ... and 1 more

### Community 79 (5 nodes)
- src/utils/embeddings.ts
- src/utils/embeddings.ts:function_declaration:getTransformers
- src/utils/embeddings.ts:function_declaration:getEmbeddingPipeline
- src/utils/embeddings.ts:function_declaration:generateEmbedding
- src/utils/embeddings.ts:function_declaration:cosineSimilarity

### Community 80 (1 nodes)
- src/utils/format.test.ts

### Community 81 (5 nodes)
- src/utils/flatten.ts
- src/utils/flatten.ts:function_declaration:flattenObject
- src/utils/flatten.ts:function_declaration:walk
- src/utils/flatten.ts:function_declaration:unflattenLines
- src/utils/flatten.ts:function_declaration:setValueByPath

### Community 82 (1 nodes)
- src/utils/flatten.test.ts

### Community 83 (4 nodes)
- src/utils/config.ts
- src/utils/config.ts:function_declaration:logDebug
- src/utils/config.ts:function_declaration:loadConfig
- src/utils/config.ts:function_declaration:saveConfig

### Community 84 (7 nodes)
- src/utils/graph-analysis.ts
- src/utils/graph-analysis.ts:interface_declaration:AnalysisResult
- src/utils/graph-analysis.ts:function_declaration:analyzeGraph
- src/utils/graph-analysis.ts:function_declaration:createGraph
- src/utils/graph-analysis.ts:function_declaration:getBlastRadius
- ... and 2 more

### Community 85 (1 nodes)
- src/utils/graph-analysis.test.ts

### Community 86 (5 nodes)
- src/utils/format.ts
- src/utils/format.ts:function_declaration:sniffFormat
- src/utils/format.ts:function_declaration:translateSnapshot
- src/utils/format.ts:function_declaration:parseRepomixXML
- src/utils/format.ts:function_declaration:stripImplementation

### Community 87 (6 nodes)
- src/utils/git.ts
- src/utils/git.ts:function_declaration:createVirtualFs
- src/utils/git.ts:function_declaration:exportVirtualFs
- src/utils/git.ts:function_declaration:walk
- src/utils/git.ts:function_declaration:getGitOptions
- ... and 1 more

### Community 88 (1 nodes)
- src/utils/graph-ast.test.ts

### Community 89 (1 nodes)
- src/utils/output.test.ts

### Community 90 (4 nodes)
- src/utils/graph-semantic.ts
- src/utils/graph-semantic.ts:interface_declaration:SemanticExtractionOptions
- src/utils/graph-semantic.ts:function_declaration:inferSemanticEdges
- src/utils/graph-semantic.ts:function_declaration:buildSemanticPrompt

### Community 91 (5 nodes)
- src/utils/graph-ast.ts
- src/utils/graph-ast.ts:function_declaration:downloadFile
- src/utils/graph-ast.ts:function_declaration:ensureWasm
- src/utils/graph-ast.ts:function_declaration:ensureInitialized
- src/utils/graph-ast.ts:function_declaration:extractGraphFromSource

### Community 92 (1 nodes)
- src/utils/hashing.test.ts

### Community 93 (6 nodes)
- src/utils/input.ts
- src/utils/input.ts:function_declaration:isStdinPiped
- src/utils/input.ts:function_declaration:readFromInput
- src/utils/input.ts:function_declaration:reestablishTTY
- src/utils/input.ts:function_declaration:readStdinSync
- ... and 1 more

### Community 94 (12 nodes)
- src/utils/output.ts
- src/utils/output.ts:function_declaration:formatOutput
- src/utils/output.ts:function_declaration:setOutputHandler
- src/utils/output.ts:function_declaration:printOutput
- src/utils/output.ts:function_declaration:printError
- ... and 7 more

### Community 95 (1 nodes)
- src/utils/path-resolver.test.ts

### Community 96 (2 nodes)
- src/utils/instruction.ts
- src/utils/instruction.ts:function_declaration:generateInstruction

### Community 97 (4 nodes)
- src/utils/hashing.ts
- src/utils/hashing.ts:interface_declaration:FileHashMap
- src/utils/hashing.ts:function_declaration:generateFileHashMap
- src/utils/hashing.ts:function_declaration:getDeltaPaths

### Community 98 (5 nodes)
- src/utils/tool-runner.ts
- src/utils/tool-runner.ts:interface_declaration:ToolResult
- src/utils/tool-runner.ts:interface_declaration:ToolRunnerOptions
- src/utils/tool-runner.ts:function_declaration:runTool
- src/utils/tool-runner.ts:function_declaration:spawnTool

### Community 99 (4 nodes)
- src/utils/path-resolver.ts
- src/utils/path-resolver.ts:function_declaration:parsePath
- src/utils/path-resolver.ts:function_declaration:getValueByPath
- src/utils/path-resolver.ts:function_declaration:setValueByPath

### Community 100 (12 nodes)
- src/utils/streaming-json.ts
- src/utils/streaming-json.ts:function_declaration:parseJSON
- src/utils/streaming-json.ts:function_declaration:applyJQ
- src/utils/streaming-json.ts:function_declaration:processSnapshot
- src/utils/streaming-json.ts:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 101 (1 nodes)
- src/utils/streaming-json.test.ts

### Community 102 (7 nodes)
- src/utils/ui.ts
- src/utils/ui.ts:interface_declaration:TreeNode
- src/utils/ui.ts:function_declaration:parseDirectoryStructure
- src/utils/ui.ts:function_declaration:parseTreeLine
- src/utils/ui.ts:function_declaration:getAllFilePaths
- ... and 2 more

### Community 103 (1 nodes)
- src/utils/ui.test.ts

### Community 104 (19 nodes)
- src/utils/webdav-vfs.ts
- src/utils/webdav-vfs.ts:class_declaration:JrefSerializer
- src/utils/webdav-vfs.ts:method_definition:uid
- src/utils/webdav-vfs.ts:method_definition:serialize
- src/utils/webdav-vfs.ts:method_definition:unserialize
- ... and 14 more

### Community 105 (1 nodes)
- src/utils/webdav-vfs.test.ts

### Community 106 (1 nodes)
- src/index.test.ts

### Community 107 (8 nodes)
- src/index.ts
- src/index.ts:function_declaration:parseGlobalOptions
- src/index.ts:function_declaration:printGlobalHelp
- src/index.ts:function_declaration:printVersion
- src/index.ts:function_declaration:expandCommandAliases
- ... and 3 more

### Community 108 (1 nodes)
- package-lock.json

### Community 109 (1 nodes)
- package.json

### Community 110 (1 nodes)
- add_test_coverage.py

### Community 111 (1 nodes)
- get_file.py

### Community 112 (1 nodes)
- make_test.py

### Community 113 (1 nodes)
- test-shell-snapshot.json

### Community 114 (1 nodes)
- tsconfig.json

### Community 115 (1 nodes)
- compare_outputs.js

### Community 116 (1 nodes)
- test_imports.js

### Community 117 (1 nodes)
- test_repomix_output.js

### Community 118 (1 nodes)
- vitest.config.ts

