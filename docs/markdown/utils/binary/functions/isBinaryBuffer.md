[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / isBinaryBuffer

# Function: isBinaryBuffer()

> **isBinaryBuffer**(`buffer`): `boolean`

Defined in: [utils/binary.ts:20](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/binary.ts#L20)

Applies a heuristic to determine if a buffer contains binary data.
The heuristic scans the first 8KB of the buffer for null bytes (0x00).

## Parameters

### buffer

`Buffer`

The buffer to check.

## Returns

`boolean`

True if the buffer is likely binary.
