[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintVerificationSchema

# Variable: BlueprintVerificationSchema

> `const` **BlueprintVerificationSchema**: `ZodObject`\<\{ `unitTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `integrationTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `manualChecklist`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `item`: `ZodString`; `passed`: `ZodBoolean`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:414](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L414)

Verification checklist and test suites for a blueprint.
