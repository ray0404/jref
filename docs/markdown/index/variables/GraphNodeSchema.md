[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphNodeSchema

# Variable: GraphNodeSchema

> `const` **GraphNodeSchema**: `ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `type`: `ZodEnum`\<\{ `code`: `"code"`; `doc`: `"doc"`; `concept`: `"concept"`; `binary`: `"binary"`; \}\>; `source_file`: `ZodString`; `source_location`: `ZodOptional`\<`ZodString`\>; `community`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [types/index.ts:67](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/types/index.ts#L67)

Runtime schema for GraphNode validation.
