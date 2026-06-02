[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / createGraph

# Function: createGraph()

> **createGraph**(`snapshot`): `DirectedGraph`

Defined in: [utils/graph-analysis.ts:87](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/graph-analysis.ts#L87)

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
