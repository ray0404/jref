[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printProgress

# Function: printProgress()

> **printProgress**(`message`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:304](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/output.ts#L304)

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
