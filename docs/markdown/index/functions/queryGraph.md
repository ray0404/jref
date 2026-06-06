[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / queryGraph

# Function: queryGraph()

> **queryGraph**(`queryStr`, `graphFile?`): `Promise`\<`any`\>

Defined in: [api/graph.ts:92](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/graph.ts#L92)

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
