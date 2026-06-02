[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / loadSnapshot

# Function: loadSnapshot()

> **loadSnapshot**(`input?`, `options?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

Defined in: [utils/streaming-json.ts:350](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/streaming-json.ts#L350)

Loads a snapshot from stdin or an optional input string.

## Parameters

### input?

`string` \| `undefined`

Optional raw string to use as input. If omitted, reads from stdin.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

Optional CLI options.

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the ProjectSnapshot.

## Throws

Error if no input is detected or provided.
