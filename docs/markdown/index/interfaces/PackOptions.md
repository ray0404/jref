[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / PackOptions

# Interface: PackOptions

Defined in: [api/pack.ts:12](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L12)

Configuration options for the `pack` function.

## Properties

### instruction?

> `optional` **instruction?**: `string`

Defined in: [api/pack.ts:16](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L16)

Optional custom instruction for the AI agent to be embedded in the snapshot.

***

### summary?

> `optional` **summary?**: `string`

Defined in: [api/pack.ts:20](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L20)

Optional summary of the project or specific focus area.

***

### maxSize?

> `optional` **maxSize?**: `number`

Defined in: [api/pack.ts:24](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L24)

Maximum size in bytes for the generated snapshot.

***

### outputStyle?

> `optional` **outputStyle?**: `"json"` \| `"xml"` \| `"markdown"` \| `"plain"`

Defined in: [api/pack.ts:28](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L28)

Visual style of the output (only affects non-JSON formats).

***

### branch?

> `optional` **branch?**: `string`

Defined in: [api/pack.ts:32](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L32)

Target git branch to pack (defaults to current).

***

### commit?

> `optional` **commit?**: `string`

Defined in: [api/pack.ts:36](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L36)

Target git commit hash to pack.

***

### compress?

> `optional` **compress?**: `boolean`

Defined in: [api/pack.ts:40](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L40)

Whether to compress the snapshot output.

***

### removeComments?

> `optional` **removeComments?**: `boolean`

Defined in: [api/pack.ts:44](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L44)

Whether to strip comments from source code files.

***

### removeEmptyLines?

> `optional` **removeEmptyLines?**: `boolean`

Defined in: [api/pack.ts:48](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L48)

Whether to remove empty lines from source code files.

***

### topFilesLength?

> `optional` **topFilesLength?**: `number`

Defined in: [api/pack.ts:52](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L52)

Number of top files to include in the summary.

***

### tokenLimit?

> `optional` **tokenLimit?**: `number`

Defined in: [api/pack.ts:56](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L56)

Token limit for the snapshot (used for AI context management).

***

### includeBinaries?

> `optional` **includeBinaries?**: `boolean`

Defined in: [api/pack.ts:60](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L60)

Whether to include binary files (encoded as Base64).

***

### maxBinarySize?

> `optional` **maxBinarySize?**: `number`

Defined in: [api/pack.ts:64](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L64)

Maximum size in bytes for an individual binary file.

***

### semantic?

> `optional` **semantic?**: `boolean`

Defined in: [api/pack.ts:68](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L68)

Whether to perform semantic analysis and generate code chunks.

***

### onProgress?

> `optional` **onProgress?**: (`message`) => `void`

Defined in: [api/pack.ts:73](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/pack.ts#L73)

Optional callback to receive progress updates during the packing process.

#### Parameters

##### message

`string`

Progress message.

#### Returns

`void`
