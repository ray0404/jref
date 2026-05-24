[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / tool

# Function: tool()

> **tool**(`command`, `commandArgs?`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:131](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/api/execution.ts#L131)

Programmatically invokes a system command and optionally parses its output into JSON.
Integrates external CLI tools (like `ls`, `git`, or `docker`) into the jref workflow.

## Parameters

### command

`string`

The system command to run.

### commandArgs?

`string`[] = `[]`

Arguments for the system command.

### options?

[`ToolOptions`](../interfaces/ToolOptions.md) = `{}`

Tool integration options.

## Returns

`Promise`\<`any`\>

A promise resolving to the (potentially parsed) command output.

## Throws

Error if the command fails to execute.
