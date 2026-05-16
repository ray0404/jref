[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / CommandDefinition

# Interface: CommandDefinition

Defined in: [utils/command.ts:42](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L42)

Metadata definition for a CLI command.

## Properties

### name

> **name**: `string`

Defined in: [utils/command.ts:46](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L46)

The unique name of the command.

***

### description

> **description**: `string`

Defined in: [utils/command.ts:50](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L50)

A brief description of the command's purpose.

***

### usage

> **usage**: `string`

Defined in: [utils/command.ts:54](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L54)

Usage string showing how to call the command.

***

### options

> **options**: [`CommandOption`](CommandOption.md)[]

Defined in: [utils/command.ts:58](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L58)

List of supported options/flags.

***

### examples

> **examples**: `string`[]

Defined in: [utils/command.ts:62](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L62)

Examples demonstrating common usage patterns.

***

### workflows?

> `optional` **workflows?**: `string`[]

Defined in: [utils/command.ts:66](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L66)

Optional list of high-level workflows this command supports.
