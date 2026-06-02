[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / getMagicNumbers

# Function: getMagicNumbers()

> **getMagicNumbers**(`content`): `Buffer`

Defined in: [utils/binary.ts:81](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/binary.ts#L81)

Extracts magic numbers (the first 16 bytes) from a Base64 encoded string.
This is performed without decoding the entire string, making it efficient 
for large binary assets.

## Parameters

### content

`string`

The Base64 encoded string.

## Returns

`Buffer`

A Buffer containing the first 16 bytes of the original data.
