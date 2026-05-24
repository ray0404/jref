[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / unflatten

# Function: unflatten()

> **unflatten**(`content`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

Defined in: [api/transform.ts:59](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/transform.ts#L59)

Programmatically reconstructs a ProjectSnapshot from a flattened content string.
Reverses the logic applied by the `flatten` function.

## Parameters

### content

`string`

The flattened codebase string.

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the reconstructed ProjectSnapshot.

## Throws

Error if the reconstruction fails.
