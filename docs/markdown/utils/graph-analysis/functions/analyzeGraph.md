[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / analyzeGraph

# Function: analyzeGraph()

> **analyzeGraph**(`snapshot`): [`AnalysisResult`](../interfaces/AnalysisResult.md)

Defined in: [utils/graph-analysis.ts:41](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/graph-analysis.ts#L41)

Analyzes the graph topology using the Louvain method for community detection
and Degree Centrality for identifying key hubs.

## Parameters

### snapshot

The raw graph snapshot to analyze.

#### nodes

`object`[] = `...`

#### edges

`object`[] = `...`

## Returns

[`AnalysisResult`](../interfaces/AnalysisResult.md)

An AnalysisResult containing topological insights.
