[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / queryGraph

# Function: queryGraph()

> **queryGraph**(`graph`, `query`): `string`[]

Defined in: [utils/graph-analysis.ts:254](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/graph-analysis.ts#L254)

Executes a simple graph traversal query using a pseudo-Cypher syntax.

## Parameters

### graph

`DirectedGraph`

The graph to query.

### query

`string`

The query string.

## Returns

`string`[]

Array of matching node IDs.

## Throws

Error if the query syntax is invalid or unsupported.

## Example

```ts
const dependents = queryGraph(graph, "MATCH (n)-[r:depends_on]->(m:src/cli.ts) RETURN n");
```
