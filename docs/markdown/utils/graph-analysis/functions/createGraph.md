[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / createGraph

# Function: createGraph()

> **createGraph**(`snapshot`): `DirectedGraph`

Defined in: [utils/graph-analysis.ts:87](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/graph-analysis.ts#L87)

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
