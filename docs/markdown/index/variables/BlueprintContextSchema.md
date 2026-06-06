[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintContextSchema

# Variable: BlueprintContextSchema

> `const` **BlueprintContextSchema**: `ZodObject`\<\{ `targetFiles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `symbols`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `dependencies`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `externalRefs`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `url`: `ZodString`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:382](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L382)

Structural context for a blueprint (files, symbols, dependencies).
