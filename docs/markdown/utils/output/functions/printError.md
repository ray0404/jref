[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printError

# Function: printError()

> **printError**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:117](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/output.ts#L117)

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
