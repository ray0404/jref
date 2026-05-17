[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / buildGraph

# Function: buildGraph()

> **buildGraph**(`target`, `options?`): `Promise`\<\{ `nodes`: `object`[]; `edges`: `object`[]; \}\>

Defined in: [api/graph.ts:44](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/graph.ts#L44)

Programmatically builds a knowledge graph from a local directory or a ProjectSnapshot.
Maps symbols, dependencies, and logical communities.

## Parameters

### target

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The target directory path or an existing ProjectSnapshot object.

### options?

[`GraphBuildOptions`](../interfaces/GraphBuildOptions.md) = `{}`

Configuration options for the graph build.

## Returns

`Promise`\<\{ `nodes`: `object`[]; `edges`: `object`[]; \}\>

A promise resolving to the generated GraphSnapshot.

## Throws

Error if the graph construction fails.

## Example

```ts
import { buildGraph } from 'jref';

const graph = await buildGraph('./src', { format: 'json' });
```
