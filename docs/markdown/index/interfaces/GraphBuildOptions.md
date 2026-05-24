[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphBuildOptions

# Interface: GraphBuildOptions

Defined in: [api/graph.ts:13](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/graph.ts#L13)

Configuration options for the `buildGraph` function.

## Properties

### output?

> `optional` **output?**: `string`

Defined in: [api/graph.ts:17](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/graph.ts#L17)

Path to save the generated graph snapshot.

***

### noLlm?

> `optional` **noLlm?**: `boolean`

Defined in: [api/graph.ts:21](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/graph.ts#L21)

Whether to skip LLM-based inference for edge detection (AST only).

***

### format?

> `optional` **format?**: `"json"` \| `"gml"` \| `"graphml"`

Defined in: [api/graph.ts:25](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/graph.ts#L25)

Export format for the graph data.
