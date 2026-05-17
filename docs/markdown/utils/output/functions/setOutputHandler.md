[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / setOutputHandler

# Function: setOutputHandler()

> **setOutputHandler**(`handler`): [`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Defined in: [utils/output.ts:71](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/utils/output.ts#L71)

Configures a custom global output handler.
This handler will be used by all print functions unless overridden locally.

## Parameters

### handler

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The handler function to set, or null to revert to default console.

## Returns

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The previously configured handler.
