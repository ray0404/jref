[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / topology

# Function: topology()

> **topology**(`snapshotA`, `snapshotB`): `Promise`\<`any`\>

Defined in: [api/graph.ts:126](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/api/graph.ts#L126)

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
