[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / QueryOptions

# Interface: QueryOptions

Defined in: [api/query.ts:12](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L12)

Configuration options for the `query` function.

## Properties

### path?

> `optional` **path?**: `string`

Defined in: [api/query.ts:16](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L16)

Specific file path to retrieve from the snapshot.

***

### semantic?

> `optional` **semantic?**: `string`

Defined in: [api/query.ts:21](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L21)

Semantic search query string.
If provided, the engine will perform a vector-based search across code chunks.

***

### topK?

> `optional` **topK?**: `number`

Defined in: [api/query.ts:25](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L25)

Number of results to return for semantic search (default: 5).

***

### lineStart?

> `optional` **lineStart?**: `number`

Defined in: [api/query.ts:29](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L29)

Starting line number for targeted file extraction (1-based).

***

### lineEnd?

> `optional` **lineEnd?**: `number`

Defined in: [api/query.ts:33](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L33)

Ending line number for targeted file extraction (inclusive).

***

### searchBinaries?

> `optional` **searchBinaries?**: `boolean`

Defined in: [api/query.ts:37](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/query.ts#L37)

Whether to include binary files in search results.
