[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / unflatten

# Function: unflatten()

> **unflatten**(`content`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

Defined in: [api/transform.ts:59](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/transform.ts#L59)

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
