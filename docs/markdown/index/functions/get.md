[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / get

# Function: get()

> **get**(`snapshot`, `path`): `Promise`\<`any`\>

Defined in: [api/data.ts:25](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/data.ts#L25)

Programmatically retrieves a nested property from a snapshot using a dot-notation path.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

### path

`string`

Dot-notation path to the property (e.g., "files.src/index.ts").

## Returns

`Promise`\<`any`\>

A promise resolving to the property value.

## Throws

Error if the retrieval fails or the path is invalid.

## Example

```ts
const instruction = await get(mySnapshot, "instruction");
```
