[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / ProjectSnapshotSchema

# Variable: ProjectSnapshotSchema

> `const` **ProjectSnapshotSchema**: `ZodObject`\<\{ `directoryStructure`: `ZodOptional`\<`ZodString`\>; `files`: `ZodRecord`\<`ZodString`, `ZodString`\>; `encodings`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `utf8`: `"utf8"`; `base64`: `"base64"`; \}\>\>\>; `instruction`: `ZodOptional`\<`ZodString`\>; `roadmap`: `ZodOptional`\<`ZodString`\>; `fileSummary`: `ZodOptional`\<`ZodString`\>; `userProvidedHeader`: `ZodOptional`\<`ZodString`\>; `chunks`: `ZodOptional`\<`ZodArray`\<`ZodCustom`\<[`CodeChunk`](../interfaces/CodeChunk.md), [`CodeChunk`](../interfaces/CodeChunk.md)\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:47](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/types/index.ts#L47)

Runtime schema for ProjectSnapshot validation.
