[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / queryGraph

# Function: queryGraph()

> **queryGraph**(`queryStr`, `graphFile?`): `Promise`\<`any`\>

Defined in: [api/graph.ts:92](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/graph.ts#L92)

Programmatically executes a traversal query against a knowledge graph.

## Parameters

### queryStr

`string`

The graph traversal query (pseudo-Cypher syntax).

### graphFile?

`string` = `'graph-snapshot.json'`

Path to the graph snapshot JSON file.

## Returns

`Promise`\<`any`\>

A promise resolving to the query results.

## Throws

Error if the query fails or the graph file is missing.
