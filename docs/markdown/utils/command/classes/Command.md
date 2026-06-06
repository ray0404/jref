[**jref - JSON Reference Tool v1.4.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/command](../README.md) / Command

# Abstract Class: Command

Defined in: [utils/command.ts:92](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L92)

Abstract base class for all CLI commands.
Implements the Command pattern and provides utility methods for output and data retrieval.

## Constructors

### Constructor

> **new Command**(): `Command`

#### Returns

`Command`

## Properties

### definition

> `abstract` `readonly` **definition**: [`CommandDefinition`](../interfaces/CommandDefinition.md)

Defined in: [utils/command.ts:96](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L96)

The metadata definition for the command.

## Methods

### execute()

> `abstract` **execute**(`args`, `options`, `context`): `Promise`\<[`CommandResult`](../../../index/interfaces/CommandResult.md)\<`any`\>\>

Defined in: [utils/command.ts:105](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L105)

Core execution logic for the command.

#### Parameters

##### args

`string`[]

Positional arguments passed to the command.

##### options

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

Parsed global and command-specific options.

##### context

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Execution context including environment state and active snapshot.

#### Returns

`Promise`\<[`CommandResult`](../../../index/interfaces/CommandResult.md)\<`any`\>\>

A promise resolving to the result of the command execution.

***

### parseArgs()

> `abstract` `protected` **parseArgs**(`args`, `context?`): `Record`\<`string`, `unknown`\>

Defined in: [utils/command.ts:117](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L117)

Parses positional arguments into a structured record.

#### Parameters

##### args

`string`[]

Raw positional arguments.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional execution context.

#### Returns

`Record`\<`string`, `unknown`\>

A map of parsed argument names to their values.

***

### getJSON()

> `protected` **getJSON**(`context`, `_options?`, `filePath?`): `Promise`\<`any`\>

Defined in: [utils/command.ts:128](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L128)

Retrieves generic JSON data from the context, a file, or stdin.
Supports JSON5 for lenient parsing.

#### Parameters

##### context

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Execution context.

##### \_options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

Optional CLI options.

##### filePath?

`string`

Optional path to a JSON file. Use '-' for stdin.

#### Returns

`Promise`\<`any`\>

A promise resolving to the parsed JSON data.

#### Throws

Error if file reading or JSON parsing fails.

***

### getSnapshot()

> `protected` **getSnapshot**(`context`, `options?`, `filePath?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

Defined in: [utils/command.ts:163](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L163)

Loads a ProjectSnapshot from context, file, or stdin.
Uses streaming JSON processing for efficiency.

#### Parameters

##### context

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Execution context.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI options (e.g., for schema validation).

##### filePath?

`string`

Optional path to the snapshot file.

#### Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

A promise resolving to the loaded ProjectSnapshot.

***

### print()

> `protected` **print**(`data`, `options`, `context?`): `void`

Defined in: [utils/command.ts:190](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L190)

Prints data to the configured output handler (stdout or custom).
Handles JSON formatting if requested in options.

#### Parameters

##### data

`unknown`

The data to print.

##### options

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI options.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context for output handler resolution.

#### Returns

`void`

***

### error()

> `protected` **error**(`message`, `options`, `exitCode?`, `context?`): [`CommandResult`](../../../index/interfaces/CommandResult.md)

Defined in: [utils/command.ts:206](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L206)

Reports an error to the user and generates a failure CommandResult.

#### Parameters

##### message

`string`

The error message.

##### options

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI options.

##### exitCode?

`1` \| `2`

Exit code for the failure (defaults to 1).

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context for output handler resolution.

#### Returns

[`CommandResult`](../../../index/interfaces/CommandResult.md)

A failed CommandResult.

***

### printSuccess()

> `protected` **printSuccess**(`message`, `options?`, `context?`): `void`

Defined in: [utils/command.ts:227](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L227)

Prints a success message to the user.
Only displays in human-readable mode (no --json/--raw).

#### Parameters

##### message

`string`

Success message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context.

#### Returns

`void`

***

### printWarning()

> `protected` **printWarning**(`message`, `options?`, `context?`): `void`

Defined in: [utils/command.ts:238](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L238)

Prints a warning message to the user.
Only displays in human-readable mode.

#### Parameters

##### message

`string`

Warning message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context.

#### Returns

`void`

***

### printInfo()

> `protected` **printInfo**(`message`, `options?`, `context?`): `void`

Defined in: [utils/command.ts:249](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L249)

Prints an informational message to the user.
Only displays in human-readable mode.

#### Parameters

##### message

`string`

Information message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context.

#### Returns

`void`

***

### printProgress()

> `protected` **printProgress**(`message`, `options?`, `context?`): `void`

Defined in: [utils/command.ts:259](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L259)

Prints a progress indicator or message.

#### Parameters

##### message

`string`

Progress message.

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

##### context?

[`CommandContext`](../../../index/interfaces/CommandContext.md)

Optional context.

#### Returns

`void`

***

### success()

> `protected` **success**\<`T`\>(`output?`, `data?`): [`CommandResult`](../../../index/interfaces/CommandResult.md)\<`T`\>

Defined in: [utils/command.ts:269](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L269)

Helper to create a successful CommandResult.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### output?

`string`

Optional human-readable output string.

##### data?

`T`

Optional structured data payload.

#### Returns

[`CommandResult`](../../../index/interfaces/CommandResult.md)\<`T`\>

A successful CommandResult.

***

### printHelp()

> **printHelp**(`options?`): `void`

Defined in: [utils/command.ts:283](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/utils/command.ts#L283)

Displays the help information for this command.
Handles both text and JSON output formats.

#### Parameters

##### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md) = `{}`

CLI options.

#### Returns

`void`
