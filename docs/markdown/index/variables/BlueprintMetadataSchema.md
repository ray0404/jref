[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintMetadataSchema

# Variable: BlueprintMetadataSchema

> `const` **BlueprintMetadataSchema**: `ZodObject`\<\{ `title`: `ZodString`; `description`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `BACKLOG`: `"BACKLOG"`; `PLANNED`: `"PLANNED"`; `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `BLOCKED`: `"BLOCKED"`; `ARCHIVED`: `"ARCHIVED"`; \}\>; `priority`: `ZodEnum`\<\{ `LOW`: `"LOW"`; `MEDIUM`: `"MEDIUM"`; `HIGH`: `"HIGH"`; `URGENT`: `"URGENT"`; \}\>; `complexity`: `ZodOptional`\<`ZodNumber`\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [types/index.ts:360](https://github.com/ray0404/jref/blob/6078995c5b0782733111f669e8cefa1a02b72f01/src/types/index.ts#L360)

Metadata for a development blueprint.
