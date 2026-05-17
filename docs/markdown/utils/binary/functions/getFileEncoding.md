[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / getFileEncoding

# Function: getFileEncoding()

> **getFileEncoding**(`buffer`): `"utf8"` \| `"base64"`

Defined in: [utils/binary.ts:49](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/binary.ts#L49)

Determines the appropriate encoding ('utf8' or 'base64') for a given buffer.

## Parameters

### buffer

`Buffer`

The data buffer.

## Returns

`"utf8"` \| `"base64"`

The encoding type to use for serialization.
