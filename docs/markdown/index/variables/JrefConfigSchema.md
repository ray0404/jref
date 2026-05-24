[**jref - JSON Reference Tool v1.1.2**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / JrefConfigSchema

# Variable: JrefConfigSchema

> `const` **JrefConfigSchema**: `ZodObject`\<\{ `defaultOutput`: `ZodDefault`\<`ZodEnum`\<\{ `json`: `"json"`; `pretty`: `"pretty"`; `raw`: `"raw"`; \}\>\>; `silent`: `ZodDefault`\<`ZodBoolean`\>; `ui`: `ZodDefault`\<`ZodObject`\<\{ `theme`: `ZodDefault`\<`ZodEnum`\<\{ `dark`: `"dark"`; `light`: `"light"`; `system`: `"system"`; \}\>\>; `showIcons`: `ZodDefault`\<`ZodBoolean`\>; \}, `$strip`\>\>; `aliasToggle`: `ZodDefault`\<`ZodBoolean`\>; `binPath`: `ZodOptional`\<`ZodString`\>; `defaultJq`: `ZodOptional`\<`ZodString`\>; `autoDownloadWasm`: `ZodDefault`\<`ZodBoolean`\>; \}, `$strip`\>

Defined in: [types/index.ts:267](https://github.com/ray0404/jref/blob/d8e69a7ea10f03a0f3952cdcdcdfcbf5e9330188/src/types/index.ts#L267)

Runtime schema for persistent jref configuration settings.
