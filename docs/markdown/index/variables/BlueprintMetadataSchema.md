[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintMetadataSchema

# Variable: BlueprintMetadataSchema

> `const` **BlueprintMetadataSchema**: `ZodObject`\<\{ `title`: `ZodString`; `description`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `BACKLOG`: `"BACKLOG"`; `PLANNED`: `"PLANNED"`; `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `BLOCKED`: `"BLOCKED"`; `ARCHIVED`: `"ARCHIVED"`; \}\>; `priority`: `ZodEnum`\<\{ `LOW`: `"LOW"`; `MEDIUM`: `"MEDIUM"`; `HIGH`: `"HIGH"`; `URGENT`: `"URGENT"`; \}\>; `complexity`: `ZodOptional`\<`ZodNumber`\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [types/index.ts:360](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L360)

Metadata for a development blueprint.
