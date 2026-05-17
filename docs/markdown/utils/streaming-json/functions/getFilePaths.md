[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / getFilePaths

# Function: getFilePaths()

> **getFilePaths**(`snapshot`, `prefix?`): `string`[]

Defined in: [utils/streaming-json.ts:418](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/streaming-json.ts#L418)

Retrieves a list of relative file paths present in the snapshot.
Optionally filters by a directory prefix.

## Parameters

### snapshot

The snapshot to query.

#### directoryStructure?

`string` = `...`

#### files

`Record`\<`string`, `string`\> = `...`

#### encodings?

`Record`\<`string`, `"utf8"` \| `"base64"`\> = `...`

#### instruction?

`string` = `...`

#### roadmap?

`string` = `...`

#### fileSummary?

`string` = `...`

#### userProvidedHeader?

`string` = `...`

#### chunks?

[`CodeChunk`](../../../index/interfaces/CodeChunk.md)[] = `...`

### prefix?

`string`

Optional directory prefix to filter paths (e.g., "src/").

## Returns

`string`[]

Array of relative file paths.
