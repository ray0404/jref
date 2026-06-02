[**jref - JSON Reference Tool v1.2.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / BlueprintVerificationSchema

# Variable: BlueprintVerificationSchema

> `const` **BlueprintVerificationSchema**: `ZodObject`\<\{ `unitTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `integrationTests`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `manualChecklist`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `item`: `ZodString`; `passed`: `ZodBoolean`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/index.ts:414](https://github.com/ray0404/jref/blob/cb137e50ba276cb5618f2ab7b5c2747a57c4fbae/src/types/index.ts#L414)

Verification checklist and test suites for a blueprint.
