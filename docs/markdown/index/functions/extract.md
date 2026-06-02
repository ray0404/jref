[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / extract

# Function: extract()

> **extract**(`snapshot`, `options?`): `Promise`\<`any`\>

Defined in: [api/fs.ts:18](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/fs.ts#L18)

Programmatically extract files from a snapshot

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### options?

[`ExtractOptions`](../interfaces/ExtractOptions.md) = `{}`

## Returns

`Promise`\<`any`\>
