[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / formatOutput

# Function: formatOutput()

> **formatOutput**(`data`, `options`): `string`

Defined in: [utils/output.ts:37](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L37)

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
