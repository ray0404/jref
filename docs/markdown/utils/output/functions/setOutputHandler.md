[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / setOutputHandler

# Function: setOutputHandler()

> **setOutputHandler**(`handler`): [`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Defined in: [utils/output.ts:71](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/output.ts#L71)

Configures a custom global output handler.
This handler will be used by all print functions unless overridden locally.

## Parameters

### handler

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The handler function to set, or null to revert to default console.

## Returns

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The previously configured handler.
