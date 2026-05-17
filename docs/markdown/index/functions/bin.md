[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / bin

# Function: bin()

> **bin**(`snapshotName`, `scriptPath`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:81](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/api/execution.ts#L81)

Programmatically executes a script from a "binary snapshot" stored in the jref bin path.
Binary snapshots are named snapshots containing reusable tools or setup scripts.

## Parameters

### snapshotName

`string`

The name of the binary snapshot (e.g., "web-starter").

### scriptPath

`string`

Path to the script within that snapshot.

### options?

[`RunOptions`](../interfaces/RunOptions.md) = `{}`

Execution options.

## Returns

`Promise`\<`any`\>

A promise resolving to the execution results.

## Throws

Error if the binary snapshot is missing or execution fails.
