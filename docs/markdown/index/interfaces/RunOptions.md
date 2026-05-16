[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [api/execution.ts:16](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/execution.ts#L16)

Configuration options for the `run` and `bin` functions.

## Properties

### args?

> `optional` **args?**: `string`[]

Defined in: [api/execution.ts:20](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/execution.ts#L20)

Command-line arguments to pass to the script.

***

### env?

> `optional` **env?**: `Record`\<`string`, `string`\>

Defined in: [api/execution.ts:24](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/api/execution.ts#L24)

Environment variable overrides for the execution context.
