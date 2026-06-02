[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / mount

# Function: mount()

> **mount**(`snapshot`, `port?`): `Promise`\<`void`\>

Defined in: [api/interactive.ts:64](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/interactive.ts#L64)

Programmatically mount a snapshot as a virtual filesystem (WebDAV)

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### port?

`number` = `8080`

## Returns

`Promise`\<`void`\>
