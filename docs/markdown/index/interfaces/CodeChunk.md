[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / CodeChunk

# Interface: CodeChunk

Defined in: [types/index.ts:13](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L13)

Represents a logical block of code identified during semantic analysis.

## Properties

### filePath

> **filePath**: `string`

Defined in: [types/index.ts:17](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L17)

Relative path to the file containing the chunk.

***

### startLine

> **startLine**: `number`

Defined in: [types/index.ts:21](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L21)

Starting line number of the chunk (1-based).

***

### endLine

> **endLine**: `number`

Defined in: [types/index.ts:25](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L25)

Ending line number of the chunk (inclusive).

***

### type

> **type**: `"function"` \| `"class"` \| `"method"` \| `"block"`

Defined in: [types/index.ts:29](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L29)

The logical category of the code block.

***

### name?

> `optional` **name?**: `string`

Defined in: [types/index.ts:33](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L33)

The identifier name of the chunk (e.g., function name), if applicable.

***

### content

> **content**: `string`

Defined in: [types/index.ts:37](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L37)

The raw source code content of the chunk.

***

### embedding?

> `optional` **embedding?**: `number`[]

Defined in: [types/index.ts:41](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L41)

Vector embedding for RAG/semantic search retrieval.
