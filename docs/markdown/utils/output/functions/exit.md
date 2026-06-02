[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / exit

# Function: exit()

> **exit**(`code`): `void`

Defined in: [utils/output.ts:359](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/output.ts#L359)

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

## Parameters

### code

`number`

The exit code (0 for success, non-zero for error).

## Returns

`void`
