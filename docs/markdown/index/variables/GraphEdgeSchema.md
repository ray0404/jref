[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / GraphEdgeSchema

# Variable: GraphEdgeSchema

> `const` **GraphEdgeSchema**: `ZodObject`\<\{ `source`: `ZodString`; `target`: `ZodString`; `relation`: `ZodString`; `confidence`: `ZodEnum`\<\{ `EXTRACTED`: `"EXTRACTED"`; `INFERRED`: `"INFERRED"`; `AMBIGUOUS`: `"AMBIGUOUS"`; \}\>; `weight`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [types/index.ts:84](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/types/index.ts#L84)

Runtime schema for GraphEdge validation.
