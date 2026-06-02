[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / extractFiles

# Function: extractFiles()

> **extractFiles**(`snapshot`, `paths`): `Record`\<`string`, `string`\>

Defined in: [utils/streaming-json.ts:435](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/streaming-json.ts#L435)

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
