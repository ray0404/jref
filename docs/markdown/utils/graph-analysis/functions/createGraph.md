[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / createGraph

# Function: createGraph()

> **createGraph**(`snapshot`): `DirectedGraph`

Defined in: [utils/graph-analysis.ts:87](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/graph-analysis.ts#L87)

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
