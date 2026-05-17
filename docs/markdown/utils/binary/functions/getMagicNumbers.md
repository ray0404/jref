[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / getMagicNumbers

# Function: getMagicNumbers()

> **getMagicNumbers**(`content`): `Buffer`

Defined in: [utils/binary.ts:81](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/binary.ts#L81)

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
