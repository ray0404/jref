[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / search

# Function: search()

> **search**(`snapshot`, `pattern`, `options?`): `Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>

Defined in: [api/search.ts:14](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/search.ts#L14)

Programmatically search a snapshot

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### pattern

`string`

### options?

[`SearchOptions`](../interfaces/SearchOptions.md) = `{}`

## Returns

`Promise`\<[`SearchResult`](../interfaces/SearchResult.md)[]\>
