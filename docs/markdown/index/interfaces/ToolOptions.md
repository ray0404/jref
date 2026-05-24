[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / ToolOptions

# Interface: ToolOptions

Defined in: [api/execution.ts:110](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/execution.ts#L110)

Configuration options for the `tool` function.

## Properties

### parser?

> `optional` **parser?**: `string`

Defined in: [api/execution.ts:114](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/execution.ts#L114)

Name of a registered parser to use for processing the command output.

***

### raw?

> `optional` **raw?**: `boolean`

Defined in: [api/execution.ts:118](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/execution.ts#L118)

Whether to return raw command output without parsing.
