[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / run

# Function: run()

> **run**(`snapshot`, `scriptPath`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:37](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/execution.ts#L37)

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
