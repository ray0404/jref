[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / isBinaryBuffer

# Function: isBinaryBuffer()

> **isBinaryBuffer**(`buffer`): `boolean`

Defined in: [utils/binary.ts:20](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/binary.ts#L20)

Applies a heuristic to determine if a buffer contains binary data.
The heuristic scans the first 8KB of the buffer for null bytes (0x00).

## Parameters

### buffer

`Buffer`

The buffer to check.

## Returns

`boolean`

True if the buffer is likely binary.
