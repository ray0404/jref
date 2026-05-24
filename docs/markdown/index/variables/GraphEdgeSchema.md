[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphEdgeSchema

# Variable: GraphEdgeSchema

> `const` **GraphEdgeSchema**: `ZodObject`\<\{ `source`: `ZodString`; `target`: `ZodString`; `relation`: `ZodString`; `confidence`: `ZodEnum`\<\{ `EXTRACTED`: `"EXTRACTED"`; `INFERRED`: `"INFERRED"`; `AMBIGUOUS`: `"AMBIGUOUS"`; \}\>; `weight`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [types/index.ts:84](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L84)

Runtime schema for GraphEdge validation.
