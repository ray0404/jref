[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printTable

# Function: printTable()

> **printTable**(`headers`, `rows`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:245](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/output.ts#L245)

Displays data in a formatted table.
Falls back to tab-separated values in raw/silent mode.

## Parameters

### headers

`string`[]

Column headers.

### rows

`string`[][]

2D array of strings representing row data.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

## Returns

`void`
