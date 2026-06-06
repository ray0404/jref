[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / summarize

# Function: summarize()

> **summarize**(`snapshot`): `Promise`\<`any`\>

Defined in: [api/transform.ts:132](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/transform.ts#L132)

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
