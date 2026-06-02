[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphEdgeSchema

# Variable: GraphEdgeSchema

> `const` **GraphEdgeSchema**: `ZodObject`\<\{ `source`: `ZodString`; `target`: `ZodString`; `relation`: `ZodString`; `confidence`: `ZodEnum`\<\{ `EXTRACTED`: `"EXTRACTED"`; `INFERRED`: `"INFERRED"`; `AMBIGUOUS`: `"AMBIGUOUS"`; \}\>; `weight`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [types/index.ts:84](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/types/index.ts#L84)

Runtime schema for GraphEdge validation.
