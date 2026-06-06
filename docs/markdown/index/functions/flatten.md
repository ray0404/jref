[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / flatten

# Function: flatten()

> **flatten**(`snapshot`): `Promise`\<`string`\>

Defined in: [api/transform.ts:23](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/transform.ts#L23)

Programmatically flattens a snapshot into a single concatenated string.
This is useful for passing codebase context to legacy AI models or storage systems
that do not support structured JSON.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

## Returns

`Promise`\<`string`\>

A promise resolving to the flattened string representation.

## Throws

Error if the flattening process fails.
