[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / patch

# Function: patch()

> **patch**(`snapshot`, `patchData`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

Defined in: [api/transform.ts:92](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/transform.ts#L92)

Programmatically applies a patch (diff or file map) to an existing snapshot.
This enables incremental updates to codebase state without full re-packing.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

### patchData

`string` \| `object`

The patch content (JSON diff or file map object).

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the updated ProjectSnapshot.

## Throws

Error if the patching process fails.

## Example

```ts
const updated = await patch(mySnapshot, { "src/index.ts": "new content" });
```
