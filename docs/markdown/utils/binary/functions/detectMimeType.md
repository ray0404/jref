[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/binary](../README.md) / detectMimeType

# Function: detectMimeType()

> **detectMimeType**(`magic`): `string`

Defined in: [utils/binary.ts:96](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/binary.ts#L96)

Detects the likely MIME type of a file based on its magic numbers.
Supports common executable, archive, image, and audio/video formats.

## Parameters

### magic

`Buffer`

A buffer containing at least the first 4-8 bytes of the file.

## Returns

`string`

The detected MIME type string, or 'application/octet-stream' as a fallback.
