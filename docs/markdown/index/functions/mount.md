[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / mount

# Function: mount()

> **mount**(`snapshot`, `port?`): `Promise`\<`void`\>

Defined in: [api/interactive.ts:64](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/interactive.ts#L64)

Programmatically mount a snapshot as a virtual filesystem (WebDAV)

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### port?

`number` = `8080`

## Returns

`Promise`\<`void`\>
