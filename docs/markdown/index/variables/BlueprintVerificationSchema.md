[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintVerificationSchema

# Variable: BlueprintVerificationSchema

> `const` **BlueprintVerificationSchema**: `ZodObject`\<\{ `unitTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `integrationTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `manualChecklist`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `item`: `ZodString`; `passed`: `ZodBoolean`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:414](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L414)

Verification checklist and test suites for a blueprint.
