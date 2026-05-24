[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / exit

# Function: exit()

> **exit**(`code`): `void`

Defined in: [utils/output.ts:359](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/output.ts#L359)

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

## Parameters

### code

`number`

The exit code (0 for success, non-zero for error).

## Returns

`void`
