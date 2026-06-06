[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / isBinaryBuffer

# Function: isBinaryBuffer()

> **isBinaryBuffer**(`buffer`): `boolean`

Defined in: [utils/binary.ts:20](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/binary.ts#L20)

Applies a heuristic to determine if a buffer contains binary data.
The heuristic scans the first 8KB of the buffer for null bytes (0x00).

## Parameters

### buffer

`Buffer`

The buffer to check.

## Returns

`boolean`

True if the buffer is likely binary.
