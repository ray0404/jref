[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printError

# Function: printError()

> **printError**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:117](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L117)

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
