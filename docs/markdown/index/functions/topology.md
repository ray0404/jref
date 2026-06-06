[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / topology

# Function: topology()

> **topology**(`snapshotA`, `snapshotB`): `Promise`\<`any`\>

Defined in: [api/graph.ts:126](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/graph.ts#L126)

Programmatically analyzes architectural drift and topological changes between two snapshots.
Useful for monitoring how a codebase structure evolves over time.

## Parameters

### snapshotA

`string`

Path to the baseline snapshot file.

### snapshotB

`string`

Path to the target snapshot file.

## Returns

`Promise`\<`any`\>

A promise resolving to the topological analysis results.

## Throws

Error if the analysis fails.
