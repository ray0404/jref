[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintStepSchema

# Variable: BlueprintStepSchema

> `const` **BlueprintStepSchema**: `ZodObject`\<\{ `id`: `ZodString`; `task`: `ZodString`; `status`: `ZodEnum`\<\{ `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `PENDING`: `"PENDING"`; `SKIPPED`: `"SKIPPED"`; \}\>; `tdd`: `ZodDefault`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [types/index.ts:395](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L395)

A single step in a blueprint implementation plan.
