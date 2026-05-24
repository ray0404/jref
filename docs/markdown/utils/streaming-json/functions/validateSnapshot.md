[**jref - JSON Reference Tool v1.1.2**](../../../README.md)

***

[jref - JSON Reference Tool](../../../modules.md) / [utils/streaming-json](../README.md) / validateSnapshot

# Function: validateSnapshot()

> **validateSnapshot**(`snapshot`): snapshot is \{ directoryStructure?: string; files: Record\<string, string\>; encodings?: Record\<string, "utf8" \| "base64"\>; instruction?: string; roadmap?: string; fileSummary?: string; userProvidedHeader?: string; chunks?: CodeChunk\[\] \}

Defined in: [utils/streaming-json.ts:406](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/utils/streaming-json.ts#L406)

Validates whether an unknown object matches the ProjectSnapshot schema.

## Parameters

### snapshot

`unknown`

The object to validate.

## Returns

snapshot is \{ directoryStructure?: string; files: Record\<string, string\>; encodings?: Record\<string, "utf8" \| "base64"\>; instruction?: string; roadmap?: string; fileSummary?: string; userProvidedHeader?: string; chunks?: CodeChunk\[\] \}

True if the object is a valid ProjectSnapshot.
