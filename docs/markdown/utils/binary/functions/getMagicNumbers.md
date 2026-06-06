[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / getMagicNumbers

# Function: getMagicNumbers()

> **getMagicNumbers**(`content`): `Buffer`

Defined in: [utils/binary.ts:81](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/binary.ts#L81)

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
