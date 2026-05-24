[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/graph-analysis](../README.md) / getCommunityNodes

# Function: getCommunityNodes()

> **getCommunityNodes**(`snapshot`, `communityId`): `string`[]

Defined in: [utils/graph-analysis.ts:152](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/graph-analysis.ts#L152)

Returns all node IDs sharing a specific community ID within a snapshot.

## Parameters

### snapshot

The snapshot containing community data.

#### nodes

`object`[] = `...`

#### edges

`object`[] = `...`

### communityId

`number`

The target community ID.

## Returns

`string`[]

Array of matching node IDs.
