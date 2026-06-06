[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / printTable

# Function: printTable()

> **printTable**(`headers`, `rows`, `options?`, `handler?`): `void`

Defined in: [utils/output.ts:245](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L245)

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
