[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / exit

# Function: exit()

> **exit**(`code`): `void`

Defined in: [utils/output.ts:359](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/output.ts#L359)

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

## Parameters

### code

`number`

The exit code (0 for success, non-zero for error).

## Returns

`void`
