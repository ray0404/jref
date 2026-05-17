[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printProgress

# Function: printProgress()

> **printProgress**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:304](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/output.ts#L304)

Prints a progress message.
Automatically suppressed in raw, silent, or JSON modes.

## Parameters

### message

`string`

Progress update message.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

## Returns

`void`
