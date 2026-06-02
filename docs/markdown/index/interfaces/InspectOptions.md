[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / InspectOptions

# Interface: InspectOptions

Defined in: [api/data.ts:97](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L97)

Configuration options for the `inspect` function.

## Properties

### metadata?

> `optional` **metadata?**: `boolean`

Defined in: [api/data.ts:101](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L101)

Whether to include quantitative metadata (file count, size).

***

### structure?

> `optional` **structure?**: `boolean`

Defined in: [api/data.ts:105](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L105)

Whether to include the directory structure tree.

***

### files?

> `optional` **files?**: `boolean`

Defined in: [api/data.ts:109](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L109)

Whether to list all files present in the snapshot.

***

### summary?

> `optional` **summary?**: `boolean`

Defined in: [api/data.ts:113](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/api/data.ts#L113)

Whether to generate a high-level summary of snapshot content.
