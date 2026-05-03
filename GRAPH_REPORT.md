# JREF Knowledge Graph Report

## God Nodes (Most Central Symbols)
- **.jref/plugins/utils/command.js** (Centrality: 0.03)
- **src/utils/command.ts** (Centrality: 0.03)
- **.jref/plugins/utils/streaming-json.js** (Centrality: 0.03)
- **src/utils/streaming-json.ts** (Centrality: 0.03)
- **.jref/plugins/utils/output.js** (Centrality: 0.02)
- **src/utils/output.ts** (Centrality: 0.02)
- **src/commands/extract.ts** (Centrality: 0.02)
- **.jref/plugins/commands/reconstruct.js** (Centrality: 0.02)
- **src/commands/config.ts** (Centrality: 0.02)
- **src/commands/reconstruct.ts** (Centrality: 0.02)

## Modular Communities
### Community 0 (5 nodes)
- .jref/plugins/commands/diff.js
- .jref/plugins/commands/diff.js:method_definition:execute
- .jref/plugins/commands/diff.js:method_definition:findExtraFiles
- .jref/plugins/commands/diff.js:method_definition:printHumanDiff
- .jref/plugins/commands/diff.js:method_definition:parseArgs

### Community 1 (7 nodes)
- .jref/plugins/commands/extract.js
- .jref/plugins/commands/extract.js:method_definition:execute
- .jref/plugins/commands/extract.js:method_definition:parseArgs
- .jref/plugins/commands/extract.js:method_definition:extractFile
- .jref/plugins/commands/extract.js:method_definition:outputDryRun
- ... and 2 more

### Community 2 (8 nodes)
- .jref/plugins/commands/inspect.js
- .jref/plugins/commands/inspect.js:method_definition:execute
- .jref/plugins/commands/inspect.js:method_definition:parseArgs
- .jref/plugins/commands/inspect.js:method_definition:printMetadata
- .jref/plugins/commands/inspect.js:method_definition:printStructure
- ... and 3 more

### Community 3 (3 nodes)
- .jref/plugins/commands/pack.js
- .jref/plugins/commands/pack.js:method_definition:execute
- .jref/plugins/commands/pack.js:method_definition:parseArgs

### Community 4 (3 nodes)
- .jref/plugins/commands/patch.js
- .jref/plugins/commands/patch.js:method_definition:execute
- .jref/plugins/commands/patch.js:method_definition:parseArgs

### Community 5 (6 nodes)
- .jref/plugins/commands/query.js
- .jref/plugins/commands/query.js:method_definition:execute
- .jref/plugins/commands/query.js:method_definition:parseArgs
- .jref/plugins/commands/query.js:method_definition:extractLineRange
- .jref/plugins/commands/query.js:method_definition:outputContent
- ... and 1 more

### Community 6 (9 nodes)
- .jref/plugins/commands/reconstruct.js
- .jref/plugins/commands/reconstruct.js:method_definition:execute
- .jref/plugins/commands/reconstruct.js:method_definition:parseArgs
- .jref/plugins/commands/reconstruct.js:method_definition:readFile
- .jref/plugins/commands/reconstruct.js:method_definition:directoryExists
- ... and 4 more

### Community 7 (4 nodes)
- .jref/plugins/commands/run.js
- .jref/plugins/commands/run.js:method_definition:execute
- .jref/plugins/commands/run.js:method_definition:parseArgs
- .jref/plugins/commands/run.js:method_definition:spawnProcess

### Community 8 (7 nodes)
- .jref/plugins/commands/search.js
- .jref/plugins/commands/search.js:method_definition:execute
- .jref/plugins/commands/search.js:method_definition:parseArgs
- .jref/plugins/commands/search.js:method_definition:createRegex
- .jref/plugins/commands/search.js:method_definition:searchContent
- ... and 2 more

### Community 9 (3 nodes)
- .jref/plugins/commands/serve.js
- .jref/plugins/commands/serve.js:method_definition:execute
- .jref/plugins/commands/serve.js:method_definition:parseArgs

### Community 10 (3 nodes)
- .jref/plugins/commands/summarize.js
- .jref/plugins/commands/summarize.js:method_definition:execute
- .jref/plugins/commands/summarize.js:method_definition:parseArgs

### Community 11 (4 nodes)
- .jref/plugins/commands/ui.js
- .jref/plugins/commands/ui.js:method_definition:execute
- .jref/plugins/commands/ui.js:method_definition:parseArgs
- .jref/plugins/commands/ui.js:method_definition:readFile

### Community 12 (4 nodes)
- .jref/plugins/components/TUI.js
- .jref/plugins/components/TUI.js:function_declaration:buildFlatTree
- .jref/plugins/components/TUI.js:function_declaration:traverse
- .jref/plugins/components/TUI.js:function_declaration:SnapshotBrowser

### Community 13 (3 nodes)
- .jref/plugins/plugins/openapi.js
- .jref/plugins/plugins/openapi.js:method_definition:execute
- .jref/plugins/plugins/openapi.js:method_definition:translateToSnapshot

### Community 14 (1 nodes)
- .jref/plugins/types/index.js

### Community 15 (13 nodes)
- .jref/plugins/utils/command.js
- .jref/plugins/utils/command.js:method_definition:getSnapshot
- .jref/plugins/utils/command.js:method_definition:print
- .jref/plugins/utils/command.js:method_definition:error
- .jref/plugins/utils/command.js:method_definition:success
- ... and 8 more

### Community 16 (5 nodes)
- .jref/plugins/utils/format.js
- .jref/plugins/utils/format.js:function_declaration:sniffFormat
- .jref/plugins/utils/format.js:function_declaration:translateSnapshot
- .jref/plugins/utils/format.js:function_declaration:parseRepomixXML
- .jref/plugins/utils/format.js:function_declaration:stripImplementation

### Community 17 (5 nodes)
- .jref/plugins/utils/input.js
- .jref/plugins/utils/input.js:function_declaration:isStdinPiped
- .jref/plugins/utils/input.js:function_declaration:readFromInput
- .jref/plugins/utils/input.js:function_declaration:reestablishTTY
- .jref/plugins/utils/input.js:function_declaration:readStdinSync

### Community 18 (2 nodes)
- .jref/plugins/utils/instruction.js
- .jref/plugins/utils/instruction.js:function_declaration:generateInstruction

### Community 19 (11 nodes)
- .jref/plugins/utils/output.js
- .jref/plugins/utils/output.js:function_declaration:formatOutput
- .jref/plugins/utils/output.js:function_declaration:printOutput
- .jref/plugins/utils/output.js:function_declaration:printError
- .jref/plugins/utils/output.js:function_declaration:printSuccess
- ... and 6 more

### Community 20 (12 nodes)
- .jref/plugins/utils/streaming-json.js
- .jref/plugins/utils/streaming-json.js:function_declaration:parseJSON
- .jref/plugins/utils/streaming-json.js:function_declaration:applyJQ
- .jref/plugins/utils/streaming-json.js:function_declaration:processSnapshot
- .jref/plugins/utils/streaming-json.js:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 21 (6 nodes)
- .jref/plugins/utils/ui.js
- .jref/plugins/utils/ui.js:function_declaration:parseDirectoryStructure
- .jref/plugins/utils/ui.js:function_declaration:parseTreeLine
- .jref/plugins/utils/ui.js:function_declaration:getAllFilePaths
- .jref/plugins/utils/ui.js:function_declaration:traverse
- ... and 1 more

### Community 22 (1 nodes)
- schemas/gemini-session-schema.json

### Community 23 (1 nodes)
- schemas/graph-snapshot-schema.json

### Community 24 (1 nodes)
- schemas/project-snapshot-schema.json

### Community 25 (1 nodes)
- schemas/tree-output-schema.json

### Community 26 (1 nodes)
- skill/jref-expert/assets/sample-snapshot.json

### Community 27 (1 nodes)
- src/commands/alias.test.ts

### Community 28 (3 nodes)
- src/commands/alias.ts
- src/commands/alias.ts:method_definition:execute
- src/commands/alias.ts:method_definition:parseArgs

### Community 29 (1 nodes)
- src/commands/bextract.test.ts

### Community 30 (3 nodes)
- src/commands/bextract.ts
- src/commands/bextract.ts:method_definition:execute
- src/commands/bextract.ts:method_definition:parseArgs

### Community 31 (4 nodes)
- src/commands/bin-setup.ts
- src/commands/bin-setup.ts:method_definition:execute
- src/commands/bin-setup.ts:method_definition:parseArgs
- src/commands/bin-setup.ts:method_definition:getSystemBinPath

### Community 32 (1 nodes)
- src/commands/bin.test.ts

### Community 33 (5 nodes)
- src/commands/bin.ts
- src/commands/bin.ts:method_definition:execute
- src/commands/bin.ts:method_definition:parseArgs
- src/commands/bin.ts:method_definition:resolveSnapshotFile
- src/commands/bin.ts:method_definition:logDiagnostic

### Community 34 (3 nodes)
- src/commands/bpack.ts
- src/commands/bpack.ts:method_definition:execute
- src/commands/bpack.ts:method_definition:parseArgs

### Community 35 (1 nodes)
- src/commands/config.test.ts

### Community 36 (9 nodes)
- src/commands/config.ts
- src/commands/config.ts:method_definition:execute
- src/commands/config.ts:method_definition:parseArgs
- src/commands/config.ts:method_definition:runUI
- src/commands/config.ts:method_definition:listConfig
- ... and 4 more

### Community 37 (1 nodes)
- src/commands/diff.test.ts

### Community 38 (7 nodes)
- src/commands/diff.ts
- src/commands/diff.ts:method_definition:execute
- src/commands/diff.ts:method_definition:computeHash
- src/commands/diff.ts:method_definition:findExtraFiles
- src/commands/diff.ts:method_definition:printHumanDiff
- ... and 2 more

### Community 39 (1 nodes)
- src/commands/extract.test.ts

### Community 40 (10 nodes)
- src/commands/extract.ts
- src/commands/extract.ts:method_definition:execute
- src/commands/extract.ts:method_definition:parseArgs
- src/commands/extract.ts:method_definition:handleListen
- src/commands/extract.ts:method_definition:read
- ... and 5 more

### Community 41 (1 nodes)
- src/commands/git.test.ts

### Community 42 (4 nodes)
- src/commands/git.ts
- src/commands/git.ts:method_definition:execute
- src/commands/git.ts:method_definition:parseArgs
- src/commands/git.ts:method_definition:getLocalFiles

### Community 43 (6 nodes)
- src/commands/graph.ts
- src/commands/graph.ts:method_definition:parseArgs
- src/commands/graph.ts:method_definition:execute
- src/commands/graph.ts:method_definition:buildGraph
- src/commands/graph.ts:method_definition:queryGraph
- ... and 1 more

### Community 44 (1 nodes)
- src/commands/inspect.test.ts

### Community 45 (8 nodes)
- src/commands/inspect.ts
- src/commands/inspect.ts:method_definition:execute
- src/commands/inspect.ts:method_definition:parseArgs
- src/commands/inspect.ts:method_definition:printMetadata
- src/commands/inspect.ts:method_definition:printStructure
- ... and 3 more

### Community 46 (1 nodes)
- src/commands/pack.test.ts

### Community 47 (3 nodes)
- src/commands/pack.ts
- src/commands/pack.ts:method_definition:execute
- src/commands/pack.ts:method_definition:parseArgs

### Community 48 (1 nodes)
- src/commands/patch.test.ts

### Community 49 (3 nodes)
- src/commands/patch.ts
- src/commands/patch.ts:method_definition:execute
- src/commands/patch.ts:method_definition:parseArgs

### Community 50 (1 nodes)
- src/commands/query.test.ts

### Community 51 (8 nodes)
- src/commands/query.ts
- src/commands/query.ts:method_definition:execute
- src/commands/query.ts:method_definition:parseArgs
- src/commands/query.ts:method_definition:executeSemanticQuery
- src/commands/query.ts:method_definition:extractImports
- ... and 3 more

### Community 52 (9 nodes)
- src/commands/reconstruct.ts
- src/commands/reconstruct.ts:method_definition:execute
- src/commands/reconstruct.ts:method_definition:parseArgs
- src/commands/reconstruct.ts:method_definition:readFile
- src/commands/reconstruct.ts:method_definition:directoryExists
- ... and 4 more

### Community 53 (4 nodes)
- src/commands/run.ts
- src/commands/run.ts:method_definition:execute
- src/commands/run.ts:method_definition:parseArgs
- src/commands/run.ts:method_definition:spawnProcess

### Community 54 (1 nodes)
- src/commands/search.test.ts

### Community 55 (7 nodes)
- src/commands/search.ts
- src/commands/search.ts:method_definition:execute
- src/commands/search.ts:method_definition:parseArgs
- src/commands/search.ts:method_definition:createRegex
- src/commands/search.ts:method_definition:searchContent
- ... and 2 more

### Community 56 (1 nodes)
- src/commands/semantic.test.ts

### Community 57 (3 nodes)
- src/commands/serve.ts
- src/commands/serve.ts:method_definition:execute
- src/commands/serve.ts:method_definition:parseArgs

### Community 58 (1 nodes)
- src/commands/summarize.test.ts

### Community 59 (4 nodes)
- src/commands/summarize.ts
- src/commands/summarize.ts:method_definition:execute
- src/commands/summarize.ts:method_definition:formatBytes
- src/commands/summarize.ts:method_definition:parseArgs

### Community 60 (1 nodes)
- src/commands/sync.test.ts

### Community 61 (1 nodes)
- src/commands/tool.test.ts

### Community 62 (4 nodes)
- src/commands/tool.ts
- src/commands/tool.ts:method_definition:execute
- src/commands/tool.ts:method_definition:parseArgs
- src/commands/tool.ts:method_definition:logDebug

### Community 63 (1 nodes)
- src/commands/ui.test.ts

### Community 64 (4 nodes)
- src/commands/ui.ts
- src/commands/ui.ts:method_definition:execute
- src/commands/ui.ts:method_definition:parseArgs
- src/commands/ui.ts:method_definition:readFile

### Community 65 (1 nodes)
- src/commands/validate.test.ts

### Community 66 (6 nodes)
- src/commands/validate.ts
- src/commands/validate.ts:method_definition:execute
- src/commands/validate.ts:method_definition:getChangedFiles
- src/commands/validate.ts:method_definition:getAllTrackedFiles
- src/commands/validate.ts:method_definition:createValidationSnapshot
- ... and 1 more

### Community 67 (2 nodes)
- src/components/ConfigUI.ts
- src/components/ConfigUI.ts:function_declaration:ConfigUI

### Community 68 (1 nodes)
- src/components/GitUI.test.ts

### Community 69 (2 nodes)
- src/components/GitUI.ts
- src/components/GitUI.ts:function_declaration:GitUI

### Community 70 (1 nodes)
- src/components/TUI.test.ts

### Community 71 (4 nodes)
- src/components/TUI.ts
- src/components/TUI.ts:function_declaration:buildFlatTree
- src/components/TUI.ts:function_declaration:traverse
- src/components/TUI.ts:function_declaration:SnapshotBrowser

### Community 72 (5 nodes)
- src/parsers/index.ts
- src/parsers/index.ts:method_definition:register
- src/parsers/index.ts:method_definition:get
- src/parsers/index.ts:method_definition:findForCommand
- src/parsers/index.ts:method_definition:getAllParsers

### Community 73 (1 nodes)
- src/parsers/ls.ts

### Community 74 (5 nodes)
- src/plugins/openapi.ts
- src/plugins/openapi.ts:method_definition:execute
- src/plugins/openapi.ts:method_definition:parseArgs
- src/plugins/openapi.ts:method_definition:translateToSnapshot
- src/plugins/openapi.ts:method_definition:generateTree

### Community 75 (1 nodes)
- src/types/index.ts

### Community 76 (1 nodes)
- src/utils/alias.test.ts

### Community 77 (5 nodes)
- src/utils/alias.ts
- src/utils/alias.ts:function_declaration:logDebug
- src/utils/alias.ts:function_declaration:loadAliasConfig
- src/utils/alias.ts:function_declaration:saveAliasConfig
- src/utils/alias.ts:function_declaration:expandAliases

### Community 78 (1 nodes)
- src/utils/binary.test.ts

### Community 79 (8 nodes)
- src/utils/binary.ts
- src/utils/binary.ts:function_declaration:isBinaryBuffer
- src/utils/binary.ts:function_declaration:isBinaryFile
- src/utils/binary.ts:function_declaration:getFileEncoding
- src/utils/binary.ts:function_declaration:decodeBase64
- ... and 3 more

### Community 80 (1 nodes)
- src/utils/chunking.test.ts

### Community 81 (5 nodes)
- src/utils/chunking.ts
- src/utils/chunking.ts:function_declaration:findBlockEnd
- src/utils/chunking.ts:function_declaration:chunkCode
- src/utils/chunking.ts:function_declaration:findPythonBlockEnd
- src/utils/chunking.ts:function_declaration:chunkByLines

### Community 82 (3 nodes)
- src/utils/command.test.ts
- src/utils/command.test.ts:method_definition:execute
- src/utils/command.test.ts:method_definition:parseArgs

### Community 83 (13 nodes)
- src/utils/command.ts
- src/utils/command.ts:method_definition:getSnapshot
- src/utils/command.ts:method_definition:print
- src/utils/command.ts:method_definition:error
- src/utils/command.ts:method_definition:success
- ... and 8 more

### Community 84 (4 nodes)
- src/utils/config.ts
- src/utils/config.ts:function_declaration:logDebug
- src/utils/config.ts:function_declaration:loadConfig
- src/utils/config.ts:function_declaration:saveConfig

### Community 85 (5 nodes)
- src/utils/dependency.ts
- src/utils/dependency.ts:function_declaration:buildDependentGraph
- src/utils/dependency.ts:function_declaration:getImports
- src/utils/dependency.ts:function_declaration:resolveImport
- src/utils/dependency.ts:function_declaration:getBlastRadius

### Community 86 (5 nodes)
- src/utils/embeddings.ts
- src/utils/embeddings.ts:function_declaration:getTransformers
- src/utils/embeddings.ts:function_declaration:getEmbeddingPipeline
- src/utils/embeddings.ts:function_declaration:generateEmbedding
- src/utils/embeddings.ts:function_declaration:cosineSimilarity

### Community 87 (1 nodes)
- src/utils/format.test.ts

### Community 88 (5 nodes)
- src/utils/format.ts
- src/utils/format.ts:function_declaration:sniffFormat
- src/utils/format.ts:function_declaration:translateSnapshot
- src/utils/format.ts:function_declaration:parseRepomixXML
- src/utils/format.ts:function_declaration:stripImplementation

### Community 89 (6 nodes)
- src/utils/git.ts
- src/utils/git.ts:function_declaration:createVirtualFs
- src/utils/git.ts:function_declaration:exportVirtualFs
- src/utils/git.ts:function_declaration:walk
- src/utils/git.ts:function_declaration:getGitOptions
- ... and 1 more

### Community 90 (3 nodes)
- src/utils/graph-analysis.ts
- src/utils/graph-analysis.ts:function_declaration:analyzeGraph
- src/utils/graph-analysis.ts:function_declaration:generateGraphReport

### Community 91 (1 nodes)
- src/utils/graph-ast.test.ts

### Community 92 (3 nodes)
- src/utils/graph-ast.ts
- src/utils/graph-ast.ts:function_declaration:ensureInitialized
- src/utils/graph-ast.ts:function_declaration:extractGraphFromSource

### Community 93 (3 nodes)
- src/utils/graph-semantic.ts
- src/utils/graph-semantic.ts:function_declaration:inferSemanticEdges
- src/utils/graph-semantic.ts:function_declaration:buildSemanticPrompt

### Community 94 (1 nodes)
- src/utils/hashing.test.ts

### Community 95 (3 nodes)
- src/utils/hashing.ts
- src/utils/hashing.ts:function_declaration:generateFileHashMap
- src/utils/hashing.ts:function_declaration:getDeltaPaths

### Community 96 (5 nodes)
- src/utils/input.ts
- src/utils/input.ts:function_declaration:isStdinPiped
- src/utils/input.ts:function_declaration:readFromInput
- src/utils/input.ts:function_declaration:reestablishTTY
- src/utils/input.ts:function_declaration:readStdinSync

### Community 97 (2 nodes)
- src/utils/instruction.ts
- src/utils/instruction.ts:function_declaration:generateInstruction

### Community 98 (1 nodes)
- src/utils/output.test.ts

### Community 99 (11 nodes)
- src/utils/output.ts
- src/utils/output.ts:function_declaration:formatOutput
- src/utils/output.ts:function_declaration:printOutput
- src/utils/output.ts:function_declaration:printError
- src/utils/output.ts:function_declaration:printSuccess
- ... and 6 more

### Community 100 (1 nodes)
- src/utils/streaming-json.test.ts

### Community 101 (12 nodes)
- src/utils/streaming-json.ts
- src/utils/streaming-json.ts:function_declaration:parseJSON
- src/utils/streaming-json.ts:function_declaration:applyJQ
- src/utils/streaming-json.ts:function_declaration:processSnapshot
- src/utils/streaming-json.ts:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 102 (3 nodes)
- src/utils/tool-runner.ts
- src/utils/tool-runner.ts:function_declaration:runTool
- src/utils/tool-runner.ts:function_declaration:spawnTool

### Community 103 (1 nodes)
- src/utils/ui.test.ts

### Community 104 (6 nodes)
- src/utils/ui.ts
- src/utils/ui.ts:function_declaration:parseDirectoryStructure
- src/utils/ui.ts:function_declaration:parseTreeLine
- src/utils/ui.ts:function_declaration:getAllFilePaths
- src/utils/ui.ts:function_declaration:traverse
- ... and 1 more

### Community 105 (1 nodes)
- src/index.test.ts

### Community 106 (5 nodes)
- src/index.ts
- src/index.ts:function_declaration:parseGlobalOptions
- src/index.ts:function_declaration:printGlobalHelp
- src/index.ts:function_declaration:printVersion
- src/index.ts:function_declaration:main

### Community 107 (1 nodes)
- graph-snapshot.json

### Community 108 (1 nodes)
- JREF_jref.json

### Community 109 (1 nodes)
- jref.json

### Community 110 (1 nodes)
- oai-api.json

### Community 111 (1 nodes)
- package.json

### Community 112 (1 nodes)
- ts-api.json

### Community 113 (1 nodes)
- tsconfig.json

### Community 114 (1 nodes)
- vitest.config.ts

