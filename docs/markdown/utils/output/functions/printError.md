[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printError

# Function: printError()

> **printError**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:117](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/output.ts#L117)

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
