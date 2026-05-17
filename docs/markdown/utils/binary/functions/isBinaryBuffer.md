[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / isBinaryBuffer

# Function: isBinaryBuffer()

> **isBinaryBuffer**(`buffer`): `boolean`

Defined in: [utils/binary.ts:20](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/binary.ts#L20)

Applies a heuristic to determine if a buffer contains binary data.
The heuristic scans the first 8KB of the buffer for null bytes (0x00).

## Parameters

### buffer

`Buffer`

The buffer to check.

## Returns

`boolean`

True if the buffer is likely binary.
