[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / query

# Function: query()

> **query**(`snapshot`, `options?`): `Promise`\<`any`\>

Defined in: [api/query.ts:61](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/query.ts#L61)

Programmatically queries a ProjectSnapshot or a snapshot file.
Supports targeted file retrieval, line-range extraction, and semantic search.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or a path to a snapshot JSON file.

### options?

[`QueryOptions`](../interfaces/QueryOptions.md) = `{}`

Configuration options for the query.

## Returns

`Promise`\<`any`\>

A promise resolving to the query result (file content, search results, or metadata).

## Throws

Error if the query fails or the snapshot is invalid.

## Example

```ts
import { query } from 'jref';

// Extract specific lines from a file in the snapshot
const content = await query(mySnapshot, {
  path: 'src/index.ts',
  lineStart: 1,
  lineEnd: 10
});
```
