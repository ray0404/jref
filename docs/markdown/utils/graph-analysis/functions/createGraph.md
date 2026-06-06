[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / createGraph

# Function: createGraph()

> **createGraph**(`snapshot`): `DirectedGraph`

Defined in: [utils/graph-analysis.ts:87](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/graph-analysis.ts#L87)

Converts a static GraphSnapshot into a live `graphology` DirectedGraph instance.

## Parameters

### snapshot

The snapshot data.

#### nodes

`object`[] = `...`

#### edges

`object`[] = `...`

## Returns

`DirectedGraph`

A live DirectedGraph instance for analysis.
