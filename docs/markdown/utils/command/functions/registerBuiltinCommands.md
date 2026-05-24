[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / registerBuiltinCommands

# Function: registerBuiltinCommands()

> **registerBuiltinCommands**(): `Promise`\<`void`\>

Defined in: [utils/command.ts:417](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L417)

Registers all core built-in commands with the global registry.
This function handles lazy loading of command implementations.

## Returns

`Promise`\<`void`\>

A promise that resolves when all commands are registered.
