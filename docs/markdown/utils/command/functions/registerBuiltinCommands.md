[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / registerBuiltinCommands

# Function: registerBuiltinCommands()

> **registerBuiltinCommands**(): `Promise`\<`void`\>

Defined in: [utils/command.ts:417](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L417)

Registers all core built-in commands with the global registry.
This function handles lazy loading of command implementations.

## Returns

`Promise`\<`void`\>

A promise that resolves when all commands are registered.
