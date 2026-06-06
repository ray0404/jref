[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/output](../README.md) / setOutputHandler

# Function: setOutputHandler()

> **setOutputHandler**(`handler`): [`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

Defined in: [utils/output.ts:71](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/output.ts#L71)

Configures a custom global output handler.
This handler will be used by all print functions unless overridden locally.

## Parameters

### handler

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The handler function to set, or null to revert to default console.

## Returns

[`OutputHandler`](../type-aliases/OutputHandler.md) \| `null`

The previously configured handler.
