[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / summarize

# Function: summarize()

> **summarize**(`snapshot`): `Promise`\<`any`\>

Defined in: [api/transform.ts:132](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/transform.ts#L132)

Programmatically generates a high-level summary map of a snapshot.
The summary includes file signatures and interface outlines, optimized for 
architectural analysis and initial planning.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

## Returns

`Promise`\<`any`\>

A promise resolving to the summary data structure.

## Throws

Error if the summarization fails.
