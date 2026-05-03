# JREF Knowledge Graph Report

## God Nodes (Most Central Symbols)
- **src/utils/command.ts** (Centrality: 0.04)
- **src/utils/streaming-json.ts** (Centrality: 0.04)
- **src/utils/output.ts** (Centrality: 0.03)
- **src/commands/extract.ts** (Centrality: 0.03)
- **src/commands/config.ts** (Centrality: 0.03)
- **src/commands/reconstruct.ts** (Centrality: 0.03)
- **src/commands/graph.ts** (Centrality: 0.02)
- **src/commands/inspect.ts** (Centrality: 0.02)
- **src/commands/query.ts** (Centrality: 0.02)
- **src/utils/binary.ts** (Centrality: 0.02)

## Modular Communities
### Community 0 (1 nodes)
- package-lock.json

### Community 1 (1 nodes)
- package.json

### Community 2 (1 nodes)
- schemas/gemini-session-schema.json

### Community 3 (1 nodes)
- schemas/graph-snapshot-schema.json

### Community 4 (1 nodes)
- schemas/project-snapshot-schema.json

### Community 5 (1 nodes)
- schemas/tree-output-schema.json

### Community 6 (1 nodes)
- skill/jref-expert/assets/sample-snapshot.json

### Community 7 (1 nodes)
- src/commands/alias.test.ts

### Community 8 (3 nodes)
- src/commands/alias.ts
- src/commands/alias.ts:method_definition:execute
- src/commands/alias.ts:method_definition:parseArgs

### Community 9 (1 nodes)
- src/commands/bextract.test.ts

### Community 10 (3 nodes)
- src/commands/bextract.ts
- src/commands/bextract.ts:method_definition:execute
- src/commands/bextract.ts:method_definition:parseArgs

### Community 11 (4 nodes)
- src/commands/bin-setup.ts
- src/commands/bin-setup.ts:method_definition:execute
- src/commands/bin-setup.ts:method_definition:parseArgs
- src/commands/bin-setup.ts:method_definition:getSystemBinPath

### Community 12 (1 nodes)
- src/commands/bin.test.ts

### Community 13 (5 nodes)
- src/commands/bin.ts
- src/commands/bin.ts:method_definition:execute
- src/commands/bin.ts:method_definition:parseArgs
- src/commands/bin.ts:method_definition:resolveSnapshotFile
- src/commands/bin.ts:method_definition:logDiagnostic

### Community 14 (3 nodes)
- src/commands/bpack.ts
- src/commands/bpack.ts:method_definition:execute
- src/commands/bpack.ts:method_definition:parseArgs

### Community 15 (1 nodes)
- src/commands/config.test.ts

### Community 16 (9 nodes)
- src/commands/config.ts
- src/commands/config.ts:method_definition:execute
- src/commands/config.ts:method_definition:parseArgs
- src/commands/config.ts:method_definition:runUI
- src/commands/config.ts:method_definition:listConfig
- ... and 4 more

### Community 17 (1 nodes)
- src/commands/diff.test.ts

### Community 18 (7 nodes)
- src/commands/diff.ts
- src/commands/diff.ts:method_definition:execute
- src/commands/diff.ts:method_definition:computeHash
- src/commands/diff.ts:method_definition:findExtraFiles
- src/commands/diff.ts:method_definition:printHumanDiff
- ... and 2 more

### Community 19 (1 nodes)
- src/commands/extract.test.ts

### Community 20 (10 nodes)
- src/commands/extract.ts
- src/commands/extract.ts:method_definition:execute
- src/commands/extract.ts:method_definition:parseArgs
- src/commands/extract.ts:method_definition:handleListen
- src/commands/extract.ts:method_definition:read
- ... and 5 more

### Community 21 (1 nodes)
- src/commands/git.test.ts

### Community 22 (4 nodes)
- src/commands/git.ts
- src/commands/git.ts:method_definition:execute
- src/commands/git.ts:method_definition:parseArgs
- src/commands/git.ts:method_definition:getLocalFiles

### Community 23 (8 nodes)
- src/commands/graph.ts
- src/commands/graph.ts:method_definition:parseArgs
- src/commands/graph.ts:method_definition:execute
- src/commands/graph.ts:method_definition:startUIServer
- src/commands/graph.ts:method_definition:getNetworkIP
- ... and 3 more

### Community 24 (1 nodes)
- src/commands/inspect.test.ts

### Community 25 (8 nodes)
- src/commands/inspect.ts
- src/commands/inspect.ts:method_definition:execute
- src/commands/inspect.ts:method_definition:parseArgs
- src/commands/inspect.ts:method_definition:printMetadata
- src/commands/inspect.ts:method_definition:printStructure
- ... and 3 more

### Community 26 (1 nodes)
- src/commands/pack.test.ts

### Community 27 (3 nodes)
- src/commands/pack.ts
- src/commands/pack.ts:method_definition:execute
- src/commands/pack.ts:method_definition:parseArgs

### Community 28 (1 nodes)
- src/commands/patch.test.ts

### Community 29 (3 nodes)
- src/commands/patch.ts
- src/commands/patch.ts:method_definition:execute
- src/commands/patch.ts:method_definition:parseArgs

### Community 30 (1 nodes)
- src/commands/query.test.ts

### Community 31 (8 nodes)
- src/commands/query.ts
- src/commands/query.ts:method_definition:execute
- src/commands/query.ts:method_definition:parseArgs
- src/commands/query.ts:method_definition:executeSemanticQuery
- src/commands/query.ts:method_definition:extractImports
- ... and 3 more

### Community 32 (9 nodes)
- src/commands/reconstruct.ts
- src/commands/reconstruct.ts:method_definition:execute
- src/commands/reconstruct.ts:method_definition:parseArgs
- src/commands/reconstruct.ts:method_definition:readFile
- src/commands/reconstruct.ts:method_definition:directoryExists
- ... and 4 more

### Community 33 (4 nodes)
- src/commands/run.ts
- src/commands/run.ts:method_definition:execute
- src/commands/run.ts:method_definition:parseArgs
- src/commands/run.ts:method_definition:spawnProcess

### Community 34 (1 nodes)
- src/commands/search.test.ts

### Community 35 (7 nodes)
- src/commands/search.ts
- src/commands/search.ts:method_definition:execute
- src/commands/search.ts:method_definition:parseArgs
- src/commands/search.ts:method_definition:createRegex
- src/commands/search.ts:method_definition:searchContent
- ... and 2 more

### Community 36 (1 nodes)
- src/commands/semantic.test.ts

### Community 37 (3 nodes)
- src/commands/serve.ts
- src/commands/serve.ts:method_definition:execute
- src/commands/serve.ts:method_definition:parseArgs

### Community 38 (1 nodes)
- src/commands/summarize.test.ts

### Community 39 (4 nodes)
- src/commands/summarize.ts
- src/commands/summarize.ts:method_definition:execute
- src/commands/summarize.ts:method_definition:formatBytes
- src/commands/summarize.ts:method_definition:parseArgs

### Community 40 (1 nodes)
- src/commands/sync.test.ts

### Community 41 (1 nodes)
- src/commands/tool.test.ts

### Community 42 (4 nodes)
- src/commands/tool.ts
- src/commands/tool.ts:method_definition:execute
- src/commands/tool.ts:method_definition:parseArgs
- src/commands/tool.ts:method_definition:logDebug

### Community 43 (1 nodes)
- src/commands/ui.test.ts

### Community 44 (4 nodes)
- src/commands/ui.ts
- src/commands/ui.ts:method_definition:execute
- src/commands/ui.ts:method_definition:parseArgs
- src/commands/ui.ts:method_definition:readFile

### Community 45 (1 nodes)
- src/commands/validate.test.ts

### Community 46 (6 nodes)
- src/commands/validate.ts
- src/commands/validate.ts:method_definition:execute
- src/commands/validate.ts:method_definition:getChangedFiles
- src/commands/validate.ts:method_definition:getAllTrackedFiles
- src/commands/validate.ts:method_definition:createValidationSnapshot
- ... and 1 more

### Community 47 (2 nodes)
- src/components/ConfigUI.ts
- src/components/ConfigUI.ts:function_declaration:ConfigUI

### Community 48 (1 nodes)
- src/components/GitUI.test.ts

### Community 49 (2 nodes)
- src/components/GitUI.ts
- src/components/GitUI.ts:function_declaration:GitUI

### Community 50 (1 nodes)
- src/components/TUI.test.ts

### Community 51 (4 nodes)
- src/components/TUI.ts
- src/components/TUI.ts:function_declaration:buildFlatTree
- src/components/TUI.ts:function_declaration:traverse
- src/components/TUI.ts:function_declaration:SnapshotBrowser

### Community 52 (1 nodes)
- src/index.test.ts

### Community 53 (5 nodes)
- src/index.ts
- src/index.ts:function_declaration:parseGlobalOptions
- src/index.ts:function_declaration:printGlobalHelp
- src/index.ts:function_declaration:printVersion
- src/index.ts:function_declaration:main

### Community 54 (5 nodes)
- src/parsers/index.ts
- src/parsers/index.ts:method_definition:register
- src/parsers/index.ts:method_definition:get
- src/parsers/index.ts:method_definition:findForCommand
- src/parsers/index.ts:method_definition:getAllParsers

### Community 55 (1 nodes)
- src/parsers/ls.ts

### Community 56 (5 nodes)
- src/plugins/openapi.ts
- src/plugins/openapi.ts:method_definition:execute
- src/plugins/openapi.ts:method_definition:parseArgs
- src/plugins/openapi.ts:method_definition:translateToSnapshot
- src/plugins/openapi.ts:method_definition:generateTree

### Community 57 (1 nodes)
- src/types/index.ts

### Community 58 (1 nodes)
- src/utils/alias.test.ts

### Community 59 (5 nodes)
- src/utils/alias.ts
- src/utils/alias.ts:function_declaration:logDebug
- src/utils/alias.ts:function_declaration:loadAliasConfig
- src/utils/alias.ts:function_declaration:saveAliasConfig
- src/utils/alias.ts:function_declaration:expandAliases

### Community 60 (1 nodes)
- src/utils/binary.test.ts

### Community 61 (8 nodes)
- src/utils/binary.ts
- src/utils/binary.ts:function_declaration:isBinaryBuffer
- src/utils/binary.ts:function_declaration:isBinaryFile
- src/utils/binary.ts:function_declaration:getFileEncoding
- src/utils/binary.ts:function_declaration:decodeBase64
- ... and 3 more

### Community 62 (1 nodes)
- src/utils/chunking.test.ts

### Community 63 (5 nodes)
- src/utils/chunking.ts
- src/utils/chunking.ts:function_declaration:findBlockEnd
- src/utils/chunking.ts:function_declaration:chunkCode
- src/utils/chunking.ts:function_declaration:findPythonBlockEnd
- src/utils/chunking.ts:function_declaration:chunkByLines

### Community 64 (3 nodes)
- src/utils/command.test.ts
- src/utils/command.test.ts:method_definition:execute
- src/utils/command.test.ts:method_definition:parseArgs

### Community 65 (13 nodes)
- src/utils/command.ts
- src/utils/command.ts:method_definition:getSnapshot
- src/utils/command.ts:method_definition:print
- src/utils/command.ts:method_definition:error
- src/utils/command.ts:method_definition:success
- ... and 8 more

### Community 66 (4 nodes)
- src/utils/config.ts
- src/utils/config.ts:function_declaration:logDebug
- src/utils/config.ts:function_declaration:loadConfig
- src/utils/config.ts:function_declaration:saveConfig

### Community 67 (5 nodes)
- src/utils/dependency.ts
- src/utils/dependency.ts:function_declaration:buildDependentGraph
- src/utils/dependency.ts:function_declaration:getImports
- src/utils/dependency.ts:function_declaration:resolveImport
- src/utils/dependency.ts:function_declaration:getBlastRadius

### Community 68 (5 nodes)
- src/utils/embeddings.ts
- src/utils/embeddings.ts:function_declaration:getTransformers
- src/utils/embeddings.ts:function_declaration:getEmbeddingPipeline
- src/utils/embeddings.ts:function_declaration:generateEmbedding
- src/utils/embeddings.ts:function_declaration:cosineSimilarity

### Community 69 (1 nodes)
- src/utils/format.test.ts

### Community 70 (5 nodes)
- src/utils/format.ts
- src/utils/format.ts:function_declaration:sniffFormat
- src/utils/format.ts:function_declaration:translateSnapshot
- src/utils/format.ts:function_declaration:parseRepomixXML
- src/utils/format.ts:function_declaration:stripImplementation

### Community 71 (6 nodes)
- src/utils/git.ts
- src/utils/git.ts:function_declaration:createVirtualFs
- src/utils/git.ts:function_declaration:exportVirtualFs
- src/utils/git.ts:function_declaration:walk
- src/utils/git.ts:function_declaration:getGitOptions
- ... and 1 more

### Community 72 (3 nodes)
- src/utils/graph-analysis.ts
- src/utils/graph-analysis.ts:function_declaration:analyzeGraph
- src/utils/graph-analysis.ts:function_declaration:generateGraphReport

### Community 73 (1 nodes)
- src/utils/graph-ast.test.ts

### Community 74 (3 nodes)
- src/utils/graph-ast.ts
- src/utils/graph-ast.ts:function_declaration:ensureInitialized
- src/utils/graph-ast.ts:function_declaration:extractGraphFromSource

### Community 75 (3 nodes)
- src/utils/graph-semantic.ts
- src/utils/graph-semantic.ts:function_declaration:inferSemanticEdges
- src/utils/graph-semantic.ts:function_declaration:buildSemanticPrompt

### Community 76 (1 nodes)
- src/utils/hashing.test.ts

### Community 77 (3 nodes)
- src/utils/hashing.ts
- src/utils/hashing.ts:function_declaration:generateFileHashMap
- src/utils/hashing.ts:function_declaration:getDeltaPaths

### Community 78 (5 nodes)
- src/utils/input.ts
- src/utils/input.ts:function_declaration:isStdinPiped
- src/utils/input.ts:function_declaration:readFromInput
- src/utils/input.ts:function_declaration:reestablishTTY
- src/utils/input.ts:function_declaration:readStdinSync

### Community 79 (2 nodes)
- src/utils/instruction.ts
- src/utils/instruction.ts:function_declaration:generateInstruction

### Community 80 (1 nodes)
- src/utils/output.test.ts

### Community 81 (11 nodes)
- src/utils/output.ts
- src/utils/output.ts:function_declaration:formatOutput
- src/utils/output.ts:function_declaration:printOutput
- src/utils/output.ts:function_declaration:printError
- src/utils/output.ts:function_declaration:printSuccess
- ... and 6 more

### Community 82 (1 nodes)
- src/utils/streaming-json.test.ts

### Community 83 (12 nodes)
- src/utils/streaming-json.ts
- src/utils/streaming-json.ts:function_declaration:parseJSON
- src/utils/streaming-json.ts:function_declaration:applyJQ
- src/utils/streaming-json.ts:function_declaration:processSnapshot
- src/utils/streaming-json.ts:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 84 (3 nodes)
- src/utils/tool-runner.ts
- src/utils/tool-runner.ts:function_declaration:runTool
- src/utils/tool-runner.ts:function_declaration:spawnTool

### Community 85 (1 nodes)
- src/utils/ui.test.ts

### Community 86 (6 nodes)
- src/utils/ui.ts
- src/utils/ui.ts:function_declaration:parseDirectoryStructure
- src/utils/ui.ts:function_declaration:parseTreeLine
- src/utils/ui.ts:function_declaration:getAllFilePaths
- src/utils/ui.ts:function_declaration:traverse
- ... and 1 more

### Community 87 (1 nodes)
- tsconfig.json

### Community 88 (1 nodes)
- vitest.config.ts

