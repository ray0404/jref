[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [api/execution.ts:16](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/execution.ts#L16)

Configuration options for the `run` and `bin` functions.

## Properties

### args?

> `optional` **args?**: `string`[]

Defined in: [api/execution.ts:20](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/execution.ts#L20)

Command-line arguments to pass to the script.

***

### env?

> `optional` **env?**: `Record`\<`string`, `string`\>

Defined in: [api/execution.ts:24](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/api/execution.ts#L24)

Environment variable overrides for the execution context.
