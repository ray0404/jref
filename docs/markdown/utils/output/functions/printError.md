[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printError

# Function: printError()

> **printError**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:117](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/output.ts#L117)

Prints an error message to stderr.
In human mode, adds a red "Error:" prefix.
In JSON mode, outputs a structured error object.

## Parameters

### message

`string`

The error message.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

## Returns

`void`
