[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / tool

# Function: tool()

> **tool**(`command`, `commandArgs?`, `options?`): `Promise`\<`any`\>

Defined in: [api/execution.ts:131](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/execution.ts#L131)

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
