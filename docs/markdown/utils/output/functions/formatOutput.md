[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / formatOutput

# Function: formatOutput()

> **formatOutput**(`data`, `options`): `string`

Defined in: [utils/output.ts:37](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/output.ts#L37)

Formats data based on the provided CLI options.
Prioritizes JSON output, then raw/silent strings, then human-readable blocks.

## Parameters

### data

`unknown`

The data payload to format.

### options

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI configuration options.

## Returns

`string`

A formatted string ready for display.
