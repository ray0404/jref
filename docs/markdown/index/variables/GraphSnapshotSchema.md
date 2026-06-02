[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphSnapshotSchema

# Variable: GraphSnapshotSchema

> `const` **GraphSnapshotSchema**: `ZodObject`\<\{ `nodes`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `type`: `ZodEnum`\<\{ `code`: `"code"`; `doc`: `"doc"`; `concept`: `"concept"`; `binary`: `"binary"`; \}\>; `source_file`: `ZodString`; `source_location`: `ZodOptional`\<`ZodString`\>; `community`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>\>; `edges`: `ZodArray`\<`ZodObject`\<\{ `source`: `ZodString`; `target`: `ZodString`; `relation`: `ZodString`; `confidence`: `ZodEnum`\<\{ `EXTRACTED`: `"EXTRACTED"`; `INFERRED`: `"INFERRED"`; `AMBIGUOUS`: `"AMBIGUOUS"`; \}\>; `weight`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>\>; \}, `$strip`\>

Defined in: [types/index.ts:100](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/types/index.ts#L100)

Runtime schema for GraphSnapshot validation.
