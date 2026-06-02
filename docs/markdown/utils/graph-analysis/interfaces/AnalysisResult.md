[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / AnalysisResult

# Interface: AnalysisResult

Defined in: [utils/graph-analysis.ts:19](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/graph-analysis.ts#L19)

Result of a structural graph analysis.

## Properties

### graph

> **graph**: `object`

Defined in: [utils/graph-analysis.ts:23](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/graph-analysis.ts#L23)

The updated graph snapshot with community and centrality data injected into nodes.

#### nodes

> **nodes**: `object`[]

#### edges

> **edges**: `object`[]

***

### godNodes

> **godNodes**: `object`[]

Defined in: [utils/graph-analysis.ts:27](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/graph-analysis.ts#L27)

Top 10 most central nodes in the graph ("God Nodes").

#### id

> **id**: `string`

#### centrality

> **centrality**: `number`

***

### communities

> **communities**: `Record`\<`number`, `string`[]\>

Defined in: [utils/graph-analysis.ts:31](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/graph-analysis.ts#L31)

Map of community IDs to arrays of node IDs belonging to those communities.
