[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintStepSchema

# Variable: BlueprintStepSchema

> `const` **BlueprintStepSchema**: `ZodObject`\<\{ `id`: `ZodString`; `task`: `ZodString`; `status`: `ZodEnum`\<\{ `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `PENDING`: `"PENDING"`; `SKIPPED`: `"SKIPPED"`; \}\>; `tdd`: `ZodDefault`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [types/index.ts:395](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/types/index.ts#L395)

A single step in a blueprint implementation plan.
