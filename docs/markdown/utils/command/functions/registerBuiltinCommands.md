[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / registerBuiltinCommands

# Function: registerBuiltinCommands()

> **registerBuiltinCommands**(): `Promise`\<`void`\>

Defined in: [utils/command.ts:417](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/utils/command.ts#L417)

Registers all core built-in commands with the global registry.
This function handles lazy loading of command implementations.

## Returns

`Promise`\<`void`\>

A promise that resolves when all commands are registered.
