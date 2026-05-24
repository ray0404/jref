[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphSnapshotSchema

# Variable: GraphSnapshotSchema

> `const` **GraphSnapshotSchema**: `ZodObject`\<\{ `nodes`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `type`: `ZodEnum`\<\{ `code`: `"code"`; `doc`: `"doc"`; `concept`: `"concept"`; `binary`: `"binary"`; \}\>; `source_file`: `ZodString`; `source_location`: `ZodOptional`\<`ZodString`\>; `community`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>\>; `edges`: `ZodArray`\<`ZodObject`\<\{ `source`: `ZodString`; `target`: `ZodString`; `relation`: `ZodString`; `confidence`: `ZodEnum`\<\{ `EXTRACTED`: `"EXTRACTED"`; `INFERRED`: `"INFERRED"`; `AMBIGUOUS`: `"AMBIGUOUS"`; \}\>; `weight`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>\>; \}, `$strip`\>

Defined in: [types/index.ts:100](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L100)

Runtime schema for GraphSnapshot validation.
