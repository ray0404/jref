[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / SearchMatch

# Interface: SearchMatch

Defined in: [types/index.ts:149](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L149)

A single match within a file during a search operation.

## Properties

### line

> **line**: `number`

Defined in: [types/index.ts:153](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L153)

Line number of the match (1-based).

***

### content

> **content**: `string`

Defined in: [types/index.ts:157](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L157)

Content of the line containing the match.

***

### startIndex

> **startIndex**: `number`

Defined in: [types/index.ts:161](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L161)

Starting character index of the match within the line.

***

### endIndex

> **endIndex**: `number`

Defined in: [types/index.ts:165](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L165)

Ending character index of the match.
