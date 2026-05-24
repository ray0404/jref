[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / CommandResult

# Interface: CommandResult\<T\>

Defined in: [types/index.ts:319](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L319)

Unified result structure for all CLI command executions.

## Type Parameters

### T

`T` = `any`

## Properties

### success

> **success**: `boolean`

Defined in: [types/index.ts:323](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L323)

Whether the command completed successfully.

***

### exitCode

> **exitCode**: [`CommandExitCode`](../type-aliases/CommandExitCode.md)

Defined in: [types/index.ts:327](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L327)

The process exit code.

***

### output?

> `optional` **output?**: `string`

Defined in: [types/index.ts:331](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L331)

Human-readable output string.

***

### data?

> `optional` **data?**: `T`

Defined in: [types/index.ts:335](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L335)

Structured data payload.

***

### error?

> `optional` **error?**: `string`

Defined in: [types/index.ts:339](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L339)

Error message if success is false.
