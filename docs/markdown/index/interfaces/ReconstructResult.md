[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / ReconstructResult

# Interface: ReconstructResult

Defined in: [types/index.ts:193](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L193)

Result of a reconstruction validation check.

## Properties

### matches

> **matches**: `boolean`

Defined in: [types/index.ts:197](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L197)

Whether the snapshot perfectly matches the filesystem.

***

### missingFiles

> **missingFiles**: `string`[]

Defined in: [types/index.ts:201](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L201)

Files present in the snapshot but missing from the disk.

***

### extraFiles

> **extraFiles**: `string`[]

Defined in: [types/index.ts:205](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L205)

Files present on disk but missing from the snapshot.

***

### modifiedFiles

> **modifiedFiles**: `string`[]

Defined in: [types/index.ts:209](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L209)

Files present in both but with differing content.

***

### totalChecked

> **totalChecked**: `number`

Defined in: [types/index.ts:213](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L213)

Total number of files compared.
