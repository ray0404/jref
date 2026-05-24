[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / calculateMetadata

# Function: calculateMetadata()

> **calculateMetadata**(`snapshot`): `object`

Defined in: [utils/streaming-json.ts:372](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/streaming-json.ts#L372)

Calculates quantitative and qualitative metadata for a given snapshot.

## Parameters

### snapshot

The snapshot to analyze.

#### directoryStructure?

`string` = `...`

#### files

`Record`\<`string`, `string`\> = `...`

#### encodings?

`Record`\<`string`, `"utf8"` \| `"base64"`\> = `...`

#### instruction?

`string` = `...`

#### roadmap?

`string` = `...`

#### fileSummary?

`string` = `...`

#### userProvidedHeader?

`string` = `...`

#### chunks?

[`CodeChunk`](../../../index/interfaces/CodeChunk.md)[] = `...`

## Returns

`object`

A SnapshotMetadata object containing counts and booleans.

### fileCount

> **fileCount**: `number`

### totalSize

> **totalSize**: `number`

### hasInstruction

> **hasInstruction**: `boolean`

### hasRoadmap

> **hasRoadmap**: `boolean`

### hasFileSummary

> **hasFileSummary**: `boolean`

### hasUserProvidedHeader

> **hasUserProvidedHeader**: `boolean`

### directoryStructureLines

> **directoryStructureLines**: `number`
