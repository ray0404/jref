[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / loadSnapshotFromFile

# Function: loadSnapshotFromFile()

> **loadSnapshotFromFile**(`filePath`, `options?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

Defined in: [utils/streaming-json.ts:337](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/streaming-json.ts#L337)

Loads and parses a snapshot from a file path.

## Parameters

### filePath

`string`

The path to the snapshot file.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

Optional CLI options.

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the ProjectSnapshot.
