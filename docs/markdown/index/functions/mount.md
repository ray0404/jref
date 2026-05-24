[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / mount

# Function: mount()

> **mount**(`snapshot`, `port?`): `Promise`\<`void`\>

Defined in: [api/interactive.ts:64](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/interactive.ts#L64)

Programmatically mount a snapshot as a virtual filesystem (WebDAV)

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### port?

`number` = `8080`

## Returns

`Promise`\<`void`\>
