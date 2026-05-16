[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / DevelopmentBlueprintSchema

# Variable: DevelopmentBlueprintSchema

> `const` **DevelopmentBlueprintSchema**: `ZodObject`\<\{ `id`: `ZodString`; `metadata`: `ZodObject`\<\{ `title`: `ZodString`; `description`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `BACKLOG`: `"BACKLOG"`; `PLANNED`: `"PLANNED"`; `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `BLOCKED`: `"BLOCKED"`; `ARCHIVED`: `"ARCHIVED"`; \}\>; `priority`: `ZodEnum`\<\{ `LOW`: `"LOW"`; `MEDIUM`: `"MEDIUM"`; `HIGH`: `"HIGH"`; `URGENT`: `"URGENT"`; \}\>; `complexity`: `ZodOptional`\<`ZodNumber`\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>; `specification`: `ZodOptional`\<`ZodObject`\<\{ `userStory`: `ZodOptional`\<`ZodString`\>; `acceptanceCriteria`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `constraints`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `outOfScope`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>\>; `context`: `ZodOptional`\<`ZodObject`\<\{ `targetFiles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `symbols`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `dependencies`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `externalRefs`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `url`: `ZodString`; \}, `$strip`\>\>\>; \}, `$strip`\>\>; `implementation`: `ZodObject`\<\{ `strategy`: `ZodString`; `steps`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `task`: `ZodString`; `status`: `ZodEnum`\<\{ `IN_PROGRESS`: `"IN_PROGRESS"`; `COMPLETED`: `"COMPLETED"`; `PENDING`: `"PENDING"`; `SKIPPED`: `"SKIPPED"`; \}\>; `tdd`: `ZodDefault`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; \}, `$strip`\>; `verification`: `ZodOptional`\<`ZodObject`\<\{ `unitTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `integrationTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `manualChecklist`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `item`: `ZodString`; `passed`: `ZodBoolean`; \}, `$strip`\>\>\>; \}, `$strip`\>\>; `history`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `timestamp`: `ZodString`; `event`: `ZodString`; `note`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:426](https://github.com/ray0404/jref/blob/ef46d6003be0734559b00ea15bb1e8a08ee22ee3/src/types/index.ts#L426)

Runtime schema for the overall Development Blueprint.
