[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printWarning

# Function: printWarning()

> **printWarning**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:192](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/output.ts#L192)

Prints a warning message.
In human mode, adds a yellow warning symbol prefix.

## Parameters

### message

`string`

The warning message.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

## Returns

`void`
