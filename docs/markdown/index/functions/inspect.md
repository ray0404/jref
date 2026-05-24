[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / inspect

# Function: inspect()

> **inspect**(`snapshot`, `options?`): `Promise`\<`any`\>

Defined in: [api/data.ts:124](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/data.ts#L124)

Programmatically inspects a snapshot to retrieve metadata and structural information.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

### options?

[`InspectOptions`](../interfaces/InspectOptions.md) = `{}`

Configuration options for the inspection.

## Returns

`Promise`\<`any`\>

A promise resolving to the inspection data.

## Throws

Error if the inspection fails.
