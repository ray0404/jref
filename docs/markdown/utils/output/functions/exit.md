[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / exit

# Function: exit()

> **exit**(`code`): `void`

Defined in: [utils/output.ts:359](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L359)

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

## Parameters

### code

`number`

The exit code (0 for success, non-zero for error).

## Returns

`void`
