# JREF Knowledge Graph Report

## God Nodes (Most Central Symbols)
- **utils/command.ts** (Centrality: 0.06)
- **utils/streaming-json.ts** (Centrality: 0.05)
- **utils/output.ts** (Centrality: 0.05)
- **commands/extract.ts** (Centrality: 0.04)
- **commands/reconstruct.ts** (Centrality: 0.04)
- **commands/inspect.ts** (Centrality: 0.03)
- **commands/query.ts** (Centrality: 0.03)
- **utils/binary.ts** (Centrality: 0.03)
- **commands/diff.ts** (Centrality: 0.03)
- **commands/search.ts** (Centrality: 0.03)

## Modular Communities
### Community 0 (1 nodes)
- commands/bextract.test.ts

### Community 1 (3 nodes)
- commands/bextract.ts
- commands/bextract.ts:method_definition:execute
- commands/bextract.ts:method_definition:parseArgs

### Community 2 (3 nodes)
- commands/bpack.ts
- commands/bpack.ts:method_definition:execute
- commands/bpack.ts:method_definition:parseArgs

### Community 3 (1 nodes)
- commands/diff.test.ts

### Community 4 (7 nodes)
- commands/diff.ts
- commands/diff.ts:method_definition:execute
- commands/diff.ts:method_definition:computeHash
- commands/diff.ts:method_definition:findExtraFiles
- commands/diff.ts:method_definition:printHumanDiff
- ... and 2 more

### Community 5 (1 nodes)
- commands/extract.test.ts

### Community 6 (10 nodes)
- commands/extract.ts
- commands/extract.ts:method_definition:execute
- commands/extract.ts:method_definition:parseArgs
- commands/extract.ts:method_definition:handleListen
- commands/extract.ts:method_definition:read
- ... and 5 more

### Community 7 (6 nodes)
- commands/graph.ts
- commands/graph.ts:method_definition:parseArgs
- commands/graph.ts:method_definition:execute
- commands/graph.ts:method_definition:buildGraph
- commands/graph.ts:method_definition:queryGraph
- ... and 1 more

### Community 8 (1 nodes)
- commands/inspect.test.ts

### Community 9 (8 nodes)
- commands/inspect.ts
- commands/inspect.ts:method_definition:execute
- commands/inspect.ts:method_definition:parseArgs
- commands/inspect.ts:method_definition:printMetadata
- commands/inspect.ts:method_definition:printStructure
- ... and 3 more

### Community 10 (1 nodes)
- commands/pack.test.ts

### Community 11 (3 nodes)
- commands/pack.ts
- commands/pack.ts:method_definition:execute
- commands/pack.ts:method_definition:parseArgs

### Community 12 (1 nodes)
- commands/patch.test.ts

### Community 13 (3 nodes)
- commands/patch.ts
- commands/patch.ts:method_definition:execute
- commands/patch.ts:method_definition:parseArgs

### Community 14 (1 nodes)
- commands/query.test.ts

### Community 15 (8 nodes)
- commands/query.ts
- commands/query.ts:method_definition:execute
- commands/query.ts:method_definition:parseArgs
- commands/query.ts:method_definition:executeSemanticQuery
- commands/query.ts:method_definition:extractImports
- ... and 3 more

### Community 16 (9 nodes)
- commands/reconstruct.ts
- commands/reconstruct.ts:method_definition:execute
- commands/reconstruct.ts:method_definition:parseArgs
- commands/reconstruct.ts:method_definition:readFile
- commands/reconstruct.ts:method_definition:directoryExists
- ... and 4 more

### Community 17 (4 nodes)
- commands/run.ts
- commands/run.ts:method_definition:execute
- commands/run.ts:method_definition:parseArgs
- commands/run.ts:method_definition:spawnProcess

### Community 18 (1 nodes)
- commands/search.test.ts

### Community 19 (7 nodes)
- commands/search.ts
- commands/search.ts:method_definition:execute
- commands/search.ts:method_definition:parseArgs
- commands/search.ts:method_definition:createRegex
- commands/search.ts:method_definition:searchContent
- ... and 2 more

### Community 20 (1 nodes)
- commands/semantic.test.ts

### Community 21 (3 nodes)
- commands/serve.ts
- commands/serve.ts:method_definition:execute
- commands/serve.ts:method_definition:parseArgs

### Community 22 (1 nodes)
- commands/summarize.test.ts

### Community 23 (4 nodes)
- commands/summarize.ts
- commands/summarize.ts:method_definition:execute
- commands/summarize.ts:method_definition:formatBytes
- commands/summarize.ts:method_definition:parseArgs

### Community 24 (1 nodes)
- commands/sync.test.ts

### Community 25 (1 nodes)
- commands/ui.test.ts

### Community 26 (4 nodes)
- commands/ui.ts
- commands/ui.ts:method_definition:execute
- commands/ui.ts:method_definition:parseArgs
- commands/ui.ts:method_definition:readFile

### Community 27 (1 nodes)
- commands/validate.test.ts

### Community 28 (6 nodes)
- commands/validate.ts
- commands/validate.ts:method_definition:execute
- commands/validate.ts:method_definition:getChangedFiles
- commands/validate.ts:method_definition:getAllTrackedFiles
- commands/validate.ts:method_definition:createValidationSnapshot
- ... and 1 more

### Community 29 (1 nodes)
- components/TUI.test.ts

### Community 30 (4 nodes)
- components/TUI.ts
- components/TUI.ts:function_declaration:buildFlatTree
- components/TUI.ts:function_declaration:traverse
- components/TUI.ts:function_declaration:SnapshotBrowser

### Community 31 (5 nodes)
- index.ts
- index.ts:function_declaration:parseGlobalOptions
- index.ts:function_declaration:printGlobalHelp
- index.ts:function_declaration:printVersion
- index.ts:function_declaration:main

### Community 32 (5 nodes)
- plugins/openapi.ts
- plugins/openapi.ts:method_definition:execute
- plugins/openapi.ts:method_definition:parseArgs
- plugins/openapi.ts:method_definition:translateToSnapshot
- plugins/openapi.ts:method_definition:generateTree

### Community 33 (1 nodes)
- types/index.ts

### Community 34 (1 nodes)
- utils/binary.test.ts

### Community 35 (8 nodes)
- utils/binary.ts
- utils/binary.ts:function_declaration:isBinaryBuffer
- utils/binary.ts:function_declaration:isBinaryFile
- utils/binary.ts:function_declaration:getFileEncoding
- utils/binary.ts:function_declaration:decodeBase64
- ... and 3 more

### Community 36 (1 nodes)
- utils/chunking.test.ts

### Community 37 (5 nodes)
- utils/chunking.ts
- utils/chunking.ts:function_declaration:findBlockEnd
- utils/chunking.ts:function_declaration:chunkCode
- utils/chunking.ts:function_declaration:findPythonBlockEnd
- utils/chunking.ts:function_declaration:chunkByLines

### Community 38 (3 nodes)
- utils/command.test.ts
- utils/command.test.ts:method_definition:execute
- utils/command.test.ts:method_definition:parseArgs

### Community 39 (13 nodes)
- utils/command.ts
- utils/command.ts:method_definition:getSnapshot
- utils/command.ts:method_definition:print
- utils/command.ts:method_definition:error
- utils/command.ts:method_definition:success
- ... and 8 more

### Community 40 (5 nodes)
- utils/dependency.ts
- utils/dependency.ts:function_declaration:buildDependentGraph
- utils/dependency.ts:function_declaration:getImports
- utils/dependency.ts:function_declaration:resolveImport
- utils/dependency.ts:function_declaration:getBlastRadius

### Community 41 (5 nodes)
- utils/embeddings.ts
- utils/embeddings.ts:function_declaration:getTransformers
- utils/embeddings.ts:function_declaration:getEmbeddingPipeline
- utils/embeddings.ts:function_declaration:generateEmbedding
- utils/embeddings.ts:function_declaration:cosineSimilarity

### Community 42 (1 nodes)
- utils/format.test.ts

### Community 43 (5 nodes)
- utils/format.ts
- utils/format.ts:function_declaration:sniffFormat
- utils/format.ts:function_declaration:translateSnapshot
- utils/format.ts:function_declaration:parseRepomixXML
- utils/format.ts:function_declaration:stripImplementation

### Community 44 (3 nodes)
- utils/graph-analysis.ts
- utils/graph-analysis.ts:function_declaration:analyzeGraph
- utils/graph-analysis.ts:function_declaration:generateGraphReport

### Community 45 (1 nodes)
- utils/graph-ast.test.ts

### Community 46 (3 nodes)
- utils/graph-ast.ts
- utils/graph-ast.ts:function_declaration:ensureInitialized
- utils/graph-ast.ts:function_declaration:extractGraphFromSource

### Community 47 (1 nodes)
- utils/hashing.test.ts

### Community 48 (3 nodes)
- utils/hashing.ts
- utils/hashing.ts:function_declaration:generateFileHashMap
- utils/hashing.ts:function_declaration:getDeltaPaths

### Community 49 (5 nodes)
- utils/input.ts
- utils/input.ts:function_declaration:isStdinPiped
- utils/input.ts:function_declaration:readFromInput
- utils/input.ts:function_declaration:reestablishTTY
- utils/input.ts:function_declaration:readStdinSync

### Community 50 (2 nodes)
- utils/instruction.ts
- utils/instruction.ts:function_declaration:generateInstruction

### Community 51 (1 nodes)
- utils/output.test.ts

### Community 52 (11 nodes)
- utils/output.ts
- utils/output.ts:function_declaration:formatOutput
- utils/output.ts:function_declaration:printOutput
- utils/output.ts:function_declaration:printError
- utils/output.ts:function_declaration:printSuccess
- ... and 6 more

### Community 53 (1 nodes)
- utils/streaming-json.test.ts

### Community 54 (12 nodes)
- utils/streaming-json.ts
- utils/streaming-json.ts:function_declaration:parseJSON
- utils/streaming-json.ts:function_declaration:applyJQ
- utils/streaming-json.ts:function_declaration:processSnapshot
- utils/streaming-json.ts:function_declaration:generateDirectoryStructure
- ... and 7 more

### Community 55 (1 nodes)
- utils/ui.test.ts

### Community 56 (6 nodes)
- utils/ui.ts
- utils/ui.ts:function_declaration:parseDirectoryStructure
- utils/ui.ts:function_declaration:parseTreeLine
- utils/ui.ts:function_declaration:getAllFilePaths
- utils/ui.ts:function_declaration:traverse
- ... and 1 more

