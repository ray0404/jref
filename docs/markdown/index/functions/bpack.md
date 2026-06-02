[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / bpack

# Function: bpack()

> **bpack**(`targetDir?`, `options?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

Defined in: [api/fs.ts:124](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/fs.ts#L124)

Programmatically archive a directory into a JSON snapshot (binary optimized)

## Parameters

### targetDir?

`string` = `'.'`

### options?

[`BPackOptions`](../interfaces/BPackOptions.md) = `{}`

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>
