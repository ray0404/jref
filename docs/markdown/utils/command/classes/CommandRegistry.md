[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / CommandRegistry

# Class: CommandRegistry

Defined in: [utils/command.ts:329](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L329)

Registry for managing and looking up available CLI commands.

## Constructors

### Constructor

> **new CommandRegistry**(): `CommandRegistry`

#### Returns

`CommandRegistry`

## Methods

### register()

> **register**(`command`): `void`

Defined in: [utils/command.ts:336](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L336)

Registers a command instance in the registry.

#### Parameters

##### command

[`Command`](Command.md)

The command to register.

#### Returns

`void`

***

### get()

> **get**(`name`): [`Command`](Command.md) \| `undefined`

Defined in: [utils/command.ts:345](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L345)

Retrieves a command by its name.

#### Parameters

##### name

`string`

The name of the command.

#### Returns

[`Command`](Command.md) \| `undefined`

The command instance if found, otherwise undefined.

***

### getCommandNames()

> **getCommandNames**(): `string`[]

Defined in: [utils/command.ts:353](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L353)

Returns a list of all registered command names.

#### Returns

`string`[]

Array of command names.

***

### has()

> **has**(`name`): `boolean`

Defined in: [utils/command.ts:362](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L362)

Checks if a command with the given name is registered.

#### Parameters

##### name

`string`

The command name.

#### Returns

`boolean`

True if the command exists.

***

### getAllCommands()

> **getAllCommands**(): [`CommandDefinition`](../interfaces/CommandDefinition.md)[]

Defined in: [utils/command.ts:370](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L370)

Returns metadata for all registered commands.

#### Returns

[`CommandDefinition`](../interfaces/CommandDefinition.md)[]

Array of CommandDefinitions.
