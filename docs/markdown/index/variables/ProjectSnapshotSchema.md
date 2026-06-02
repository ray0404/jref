[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / ProjectSnapshotSchema

# Variable: ProjectSnapshotSchema

> `const` **ProjectSnapshotSchema**: `ZodObject`\<\{ `directoryStructure`: `ZodOptional`\<`ZodString`\>; `files`: `ZodRecord`\<`ZodString`, `ZodString`\>; `encodings`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `utf8`: `"utf8"`; `base64`: `"base64"`; \}\>\>\>; `instruction`: `ZodOptional`\<`ZodString`\>; `roadmap`: `ZodOptional`\<`ZodString`\>; `fileSummary`: `ZodOptional`\<`ZodString`\>; `userProvidedHeader`: `ZodOptional`\<`ZodString`\>; `chunks`: `ZodOptional`\<`ZodArray`\<`ZodCustom`\<[`CodeChunk`](../interfaces/CodeChunk.md), [`CodeChunk`](../interfaces/CodeChunk.md)\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:47](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/types/index.ts#L47)

Runtime schema for ProjectSnapshot validation.
