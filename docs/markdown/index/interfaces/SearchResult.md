[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / SearchResult

# Interface: SearchResult

Defined in: [types/index.ts:131](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L131)

Result of a file search operation.

## Properties

### filePath

> **filePath**: `string`

Defined in: [types/index.ts:135](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L135)

Path to the file where matches were found.

***

### matches

> **matches**: [`SearchMatch`](SearchMatch.md)[]

Defined in: [types/index.ts:139](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L139)

List of specific matches within the file.

***

### score

> **score**: `number`

Defined in: [types/index.ts:143](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L143)

Relevance score for the search result.
