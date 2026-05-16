[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / getBlastRadius

# Function: getBlastRadius()

> **getBlastRadius**(`graph`, `nodeId`, `depth?`): `string`[]

Defined in: [utils/graph-analysis.ts:122](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/graph-analysis.ts#L122)

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
