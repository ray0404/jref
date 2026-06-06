[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / tool

# Function: tool()

> **tool**(`command`, `commandArgs?`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:131](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/execution.ts#L131)

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
