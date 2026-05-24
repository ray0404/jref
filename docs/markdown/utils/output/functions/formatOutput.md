[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / formatOutput

# Function: formatOutput()

> **formatOutput**(`data`, `options`): `string`

Defined in: [utils/output.ts:37](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/output.ts#L37)

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
