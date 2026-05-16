[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / exit

# Function: exit()

> **exit**(`code`): `void`

Defined in: [utils/output.ts:359](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/output.ts#L359)

Gracefully terminates the process, ensuring all pending output streams are flushed.
This is critical when piping CLI output to other tools.

## Parameters

### code

`number`

The exit code (0 for success, non-zero for error).

## Returns

`void`
