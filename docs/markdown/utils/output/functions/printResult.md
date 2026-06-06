[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printResult

# Function: printResult()

> **printResult**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:169](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L169)

Prints raw result text without decorative symbols.
Useful for piping data or emitting specific status messages.

## Parameters

### message

`string`

The result message.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

## Returns

`void`
