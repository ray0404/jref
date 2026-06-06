[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / pack

# Function: pack()

> **pack**(`targetDir?`, `options?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

Defined in: [api/pack.ts:95](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/pack.ts#L95)

Programmatically generates a condensed JSON snapshot of a codebase.
This is the core engine used by the `jref pack` command.

## Parameters

### targetDir?

`string` = `'.'`

The root directory of the project to pack (defaults to current directory).

### options?

[`PackOptions`](../interfaces/PackOptions.md) = `{}`

Configuration options for the packing process.

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the generated ProjectSnapshot.

## Throws

Error if the packing process fails or the target directory is inaccessible.

## Example

```ts
import { pack } from 'jref';

const snapshot = await pack('./src', {
  instruction: "Analyze this TypeScript project.",
  compress: true
});
```
