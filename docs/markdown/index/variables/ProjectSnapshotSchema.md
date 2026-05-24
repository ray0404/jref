[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / ProjectSnapshotSchema

# Variable: ProjectSnapshotSchema

> `const` **ProjectSnapshotSchema**: `ZodObject`\<\{ `directoryStructure`: `ZodOptional`\<`ZodString`\>; `files`: `ZodRecord`\<`ZodString`, `ZodString`\>; `encodings`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `utf8`: `"utf8"`; `base64`: `"base64"`; \}\>\>\>; `instruction`: `ZodOptional`\<`ZodString`\>; `roadmap`: `ZodOptional`\<`ZodString`\>; `fileSummary`: `ZodOptional`\<`ZodString`\>; `userProvidedHeader`: `ZodOptional`\<`ZodString`\>; `chunks`: `ZodOptional`\<`ZodArray`\<`ZodCustom`\<[`CodeChunk`](../interfaces/CodeChunk.md), [`CodeChunk`](../interfaces/CodeChunk.md)\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:47](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L47)

Runtime schema for ProjectSnapshot validation.
