[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / JrefPlugin

# Interface: JrefPlugin

Defined in: [utils/command.ts:72](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L72)

Interface for jref plugins that extend the CLI.

## Properties

### name

> **name**: `string`

Defined in: [utils/command.ts:76](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L76)

The display name of the plugin.

***

### version

> **version**: `string`

Defined in: [utils/command.ts:80](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L80)

Semantic version of the plugin.

***

### register

> **register**: (`registry`) => `void`

Defined in: [utils/command.ts:85](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/command.ts#L85)

Registration callback to add commands to the registry.

#### Parameters

##### registry

[`CommandRegistry`](../classes/CommandRegistry.md)

The global command registry instance.

#### Returns

`void`
