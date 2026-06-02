[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / CommandOption

# Interface: CommandOption

Defined in: [utils/command.ts:24](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/command.ts#L24)

Represents a single CLI option for a command.

## Properties

### flags

> **flags**: `string`

Defined in: [utils/command.ts:28](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/command.ts#L28)

The flags used to invoke this option (e.g., "-f, --file <path>").

***

### description

> **description**: `string`

Defined in: [utils/command.ts:32](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/command.ts#L32)

A short description of what the option does.

***

### defaultValue?

> `optional` **defaultValue?**: `any`

Defined in: [utils/command.ts:36](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/utils/command.ts#L36)

The default value for the option if not provided.
