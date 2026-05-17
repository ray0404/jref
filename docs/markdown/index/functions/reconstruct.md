[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / reconstruct

# Function: reconstruct()

> **reconstruct**(`snapshot`, `targetDir?`): `Promise`\<`any`\>

Defined in: [api/fs.ts:87](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/fs.ts#L87)

Programmatically reconstruct/verify local files from a snapshot

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

### targetDir?

`string` = `'.'`

## Returns

`Promise`\<`any`\>
