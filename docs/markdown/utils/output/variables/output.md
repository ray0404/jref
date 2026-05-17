[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / output

# Variable: output

> `const` **output**: `object`

Defined in: [utils/output.ts:375](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/output.ts#L375)

Bundled output utilities for easier programmatic consumption.

## Type Declaration

### print

> **print**: (`data`, `options`, `handler?`) => `void` = `printOutput`

Prints data to the appropriate output stream using formatting logic.

#### Parameters

##### data

`unknown`

Data to print.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### success

> **success**: (`message`, `options`, `handler?`) => `void` = `printSuccess`

Prints a success message.
In human mode, adds a green checkmark prefix.

#### Parameters

##### message

`string`

The success message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### error

> **error**: (`message`, `options`, `handler?`) => `void` = `printError`

Prints an error message to stderr.
In human mode, adds a red "Error:" prefix.
In JSON mode, outputs a structured error object.

#### Parameters

##### message

`string`

The error message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### warn

> **warn**: (`message`, `options`, `handler?`) => `void` = `printWarning`

Prints a warning message.
In human mode, adds a yellow warning symbol prefix.

#### Parameters

##### message

`string`

The warning message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### info

> **info**: (`message`, `options`, `handler?`) => `void` = `printInfo`

Prints an informational message.
In human mode, adds a cyan info symbol prefix.

#### Parameters

##### message

`string`

The information message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### table

> **table**: (`headers`, `rows`, `options`, `handler?`) => `void` = `printTable`

Displays data in a formatted table.
Falls back to tab-separated values in raw/silent mode.

#### Parameters

##### headers

`string`[]

Column headers.

##### rows

`string`[][]

2D array of strings representing row data.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### progress

> **progress**: (`message`, `options`, `handler?`) => `void` = `printProgress`

Prints a progress message.
Automatically suppressed in raw, silent, or JSON modes.

#### Parameters

##### message

`string`

Progress update message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### header

> **header**: (`options`, `handler?`) => `void` = `printHeader`

Prints the jref ASCII art header.
Suppressed in non-human modes.

#### Parameters

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### handler?

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Optional local output handler override.

#### Returns

`void`

### format

> **format**: (`data`, `options`) => `string` = `formatOutput`

Formats data based on the provided CLI options.
Prioritizes JSON output, then raw/silent strings, then human-readable blocks.

#### Parameters

##### data

`unknown`

The data payload to format.

##### options

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI configuration options.

#### Returns

`string`

A formatted string ready for display.

### exit

> **exit**: (`code`) => `void`

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

#### Parameters

##### code

`number`

The exit code (0 for success, non-zero for error).

#### Returns

`void`
