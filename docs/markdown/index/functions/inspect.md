[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / inspect

# Function: inspect()

> **inspect**(`snapshot`, `options?`): `Promise`\<`any`\>

Defined in: [api/data.ts:124](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L124)

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
