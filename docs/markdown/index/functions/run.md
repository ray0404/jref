[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / run

# Function: run()

> **run**(`snapshot`, `scriptPath`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:37](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/execution.ts#L37)

Programmatically executes a script contained within a ProjectSnapshot.
The script is executed in a virtualized environment or temporary workspace.

## Parameters

### snapshot

`string` \| \{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../interfaces/CodeChunk.md)[]; \}

The ProjectSnapshot object or path to a snapshot file.

### scriptPath

`string`

Relative path to the script within the snapshot.

### options?

[`RunOptions`](../interfaces/RunOptions.md) = `{}`

Execution options (args, env).

## Returns

`Promise`\<`any`\>

A promise resolving to the script's output or result data.

## Throws

Error if the execution fails or the script is not found.
