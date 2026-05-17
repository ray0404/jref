[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / analyzeGraph

# Function: analyzeGraph()

> **analyzeGraph**(`snapshot`): [`AnalysisResult`](../interfaces/AnalysisResult.md)

Defined in: [utils/graph-analysis.ts:41](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/graph-analysis.ts#L41)

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
