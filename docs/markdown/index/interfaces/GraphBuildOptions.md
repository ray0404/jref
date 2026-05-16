[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphBuildOptions

# Interface: GraphBuildOptions

Defined in: [api/graph.ts:13](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/graph.ts#L13)

Configuration options for the `buildGraph` function.

## Properties

### output?

> `optional` **output?**: `string`

Defined in: [api/graph.ts:17](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/graph.ts#L17)

Path to save the generated graph snapshot.

***

### noLlm?

> `optional` **noLlm?**: `boolean`

Defined in: [api/graph.ts:21](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/graph.ts#L21)

Whether to skip LLM-based inference for edge detection (AST only).

***

### format?

> `optional` **format?**: `"json"` \| `"gml"` \| `"graphml"`

Defined in: [api/graph.ts:25](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/graph.ts#L25)

Export format for the graph data.
