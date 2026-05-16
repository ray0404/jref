[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / CommandContext

# Interface: CommandContext

Defined in: [types/index.ts:288](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L288)

Execution context for CLI commands.

## Properties

### stdin?

> `optional` **stdin?**: `string`

Defined in: [types/index.ts:292](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L292)

Content received from stdin.

***

### stdinIsPipe

> **stdinIsPipe**: `boolean`

Defined in: [types/index.ts:296](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L296)

Whether stdin is being piped from another process.

***

### snapshot?

> `optional` **snapshot?**: `object`

Defined in: [types/index.ts:300](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L300)

Pre-loaded ProjectSnapshot for optimized command execution.

#### directoryStructure?

> `optional` **directoryStructure?**: `string`

#### files

> **files**: `Record`\<`string`, `string`\>

#### encodings?

> `optional` **encodings?**: `Record`\<`string`, `"utf8"` \| `"base64"`\>

#### instruction?

> `optional` **instruction?**: `string`

#### roadmap?

> `optional` **roadmap?**: `string`

#### fileSummary?

> `optional` **fileSummary?**: `string`

#### userProvidedHeader?

> `optional` **userProvidedHeader?**: `string`

#### chunks?

> `optional` **chunks?**: [`CodeChunk`](CodeChunk.md)[]

***

### metadata?

> `optional` **metadata?**: `object`

Defined in: [types/index.ts:304](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L304)

Pre-calculated metadata for the active snapshot.

#### fileCount

> **fileCount**: `number`

#### totalSize

> **totalSize**: `number`

#### hasInstruction

> **hasInstruction**: `boolean`

#### hasRoadmap

> **hasRoadmap**: `boolean`

#### hasFileSummary

> **hasFileSummary**: `boolean`

#### hasUserProvidedHeader

> **hasUserProvidedHeader**: `boolean`

#### directoryStructureLines

> **directoryStructureLines**: `number`

***

### outputHandler?

> `optional` **outputHandler?**: (`data`, `type`) => `void`

Defined in: [types/index.ts:308](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L308)

Custom output handler for redirecting prints.

#### Parameters

##### data

`string`

##### type

`"stdout"` \| `"stderr"`

#### Returns

`void`
