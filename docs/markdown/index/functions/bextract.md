[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / bextract

# Function: bextract()

> **bextract**(`snapshot`, `outputDir?`): `Promise`\<`any`\>

Defined in: [api/fs.ts:151](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/fs.ts#L151)

Programmatically extract files from a binary-optimized snapshot

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### outputDir?

`string` = `'.'`

## Returns

`Promise`\<`any`\>
