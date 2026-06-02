[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / UMFS

# Class: UMFS

Defined in: [utils/umfs.ts:17](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/umfs.ts#L17)

## Constructors

### Constructor

> **new UMFS**(): `UMFS`

#### Returns

`UMFS`

## Methods

### isValid()

> `static` **isValid**(`filename`): `boolean`

Defined in: [utils/umfs.ts:25](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/umfs.ts#L25)

Validates if a filename conforms to the UMFS specification.

#### Parameters

##### filename

`string`

The raw filename string to test.

#### Returns

`boolean`

***

### parse()

> `static` **parse**(`filename`): [`UMFSMeta`](../interfaces/UMFSMeta.md) \| `null`

Defined in: [utils/umfs.ts:34](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/umfs.ts#L34)

Programmatically parses a filename into structural metadata components.

#### Parameters

##### filename

`string`

The raw filename string.

#### Returns

[`UMFSMeta`](../interfaces/UMFSMeta.md) \| `null`

UMFSMeta object if valid, otherwise null.

***

### stringify()

> `static` **stringify**(`meta`): `string`

Defined in: [utils/umfs.ts:56](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/umfs.ts#L56)

Programmatically builds a compliant UMFS filename from structured metadata.
Enforces rules such as blocking underscores in project names and validating structures.

#### Parameters

##### meta

[`UMFSMeta`](../interfaces/UMFSMeta.md)

Metadata configuration.

#### Returns

`string`
