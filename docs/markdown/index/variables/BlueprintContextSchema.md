[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintContextSchema

# Variable: BlueprintContextSchema

> `const` **BlueprintContextSchema**: `ZodObject`\<\{ `targetFiles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `symbols`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `dependencies`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `externalRefs`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `url`: `ZodString`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:382](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L382)

Structural context for a blueprint (files, symbols, dependencies).
