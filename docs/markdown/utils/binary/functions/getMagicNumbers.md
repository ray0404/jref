[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / getMagicNumbers

# Function: getMagicNumbers()

> **getMagicNumbers**(`content`): `Buffer`

Defined in: [utils/binary.ts:81](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/binary.ts#L81)

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
