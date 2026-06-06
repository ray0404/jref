[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / extractFiles

# Function: extractFiles()

> **extractFiles**(`snapshot`, `paths`): `Record`\<`string`, `string`\>

Defined in: [utils/streaming-json.ts:435](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/streaming-json.ts#L435)

Extracts a subset of files from a snapshot based on an array of paths.

## Parameters

### snapshot

The source snapshot.

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

### paths

`string`[]

Array of relative paths to extract.

## Returns

`Record`\<`string`, `string`\>

A record map containing only the requested files.
