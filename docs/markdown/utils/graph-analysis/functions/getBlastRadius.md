[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / getBlastRadius

# Function: getBlastRadius()

> **getBlastRadius**(`graph`, `nodeId`, `depth?`): `string`[]

Defined in: [utils/graph-analysis.ts:122](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/graph-analysis.ts#L122)

Calculates the "Blast Radius" of a node by traversing inbound edges (dependents).
Identifies all symbols that directly or indirectly depend on the target node.

## Parameters

### graph

`DirectedGraph`

The graph to traverse.

### nodeId

`string`

The ID of the node starting the traversal.

### depth?

`number` = `1`

How many levels of dependency to traverse (default: 1).

## Returns

`string`[]

Array of node IDs within the blast radius.
