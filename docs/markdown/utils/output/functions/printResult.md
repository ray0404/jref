[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printResult

# Function: printResult()

> **printResult**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:169](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/output.ts#L169)

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
