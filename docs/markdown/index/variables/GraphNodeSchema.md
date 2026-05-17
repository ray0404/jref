[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphNodeSchema

# Variable: GraphNodeSchema

> `const` **GraphNodeSchema**: `ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `type`: `ZodEnum`\<\{ `code`: `"code"`; `doc`: `"doc"`; `concept`: `"concept"`; `binary`: `"binary"`; \}\>; `source_file`: `ZodString`; `source_location`: `ZodOptional`\<`ZodString`\>; `community`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [types/index.ts:67](https://github.com/ray0404/jref/blob/66a4d38b3b6dfa41694653cf3f7b2c3042974f0a/src/types/index.ts#L67)

Runtime schema for GraphNode validation.
