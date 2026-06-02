[**jref - JSON Reference Tool v1.2.0**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / parseJSON

# Function: parseJSON()

> **parseJSON**(`input`, `filePath?`, `options?`): `Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

Defined in: [utils/streaming-json.ts:39](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/utils/streaming-json.ts#L39)

High-level entry point for parsing JSON input into a ProjectSnapshot.
Automatically chooses between native `JSON.parse` (for speed on small files)
and the streaming parser (for memory safety on large files).

## Parameters

### input

`string`

The raw JSON string or data to parse.

### filePath?

`string`

Optional file path for format sniffing and error reporting.

### options?

[`CLIOptions`](../../../index/interfaces/CLIOptions.md)

CLI options, including JQ filters and validation settings.

## Returns

`Promise`\<\{ `directoryStructure?`: `string`; `files`: `Record`\<`string`, `string`\>; `encodings?`: `Record`\<`string`, `"utf8"` \| `"base64"`\>; `instruction?`: `string`; `roadmap?`: `string`; `fileSummary?`: `string`; `userProvidedHeader?`: `string`; `chunks?`: [`CodeChunk`](../../../index/interfaces/CodeChunk.md)[]; \}\>

A promise resolving to a validated ProjectSnapshot.

## Throws

Error if the input is malformed or violates the required schema.

## Example

```ts
const snapshot = await parseJSON(rawContent, 'project.json');
```
