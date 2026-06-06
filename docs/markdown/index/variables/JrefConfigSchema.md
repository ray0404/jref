[**jref - JSON Reference Tool v1.4.0**](../../README.md)

***

[jref - JSON Reference Tool](../../modules.md) / [index](../README.md) / JrefConfigSchema

# Variable: JrefConfigSchema

> `const` **JrefConfigSchema**: `ZodObject`\<\{ `defaultOutput`: `ZodDefault`\<`ZodEnum`\<\{ `json`: `"json"`; `pretty`: `"pretty"`; `raw`: `"raw"`; \}\>\>; `silent`: `ZodDefault`\<`ZodBoolean`\>; `ui`: `ZodDefault`\<`ZodObject`\<\{ `theme`: `ZodDefault`\<`ZodEnum`\<\{ `dark`: `"dark"`; `light`: `"light"`; `system`: `"system"`; \}\>\>; `showIcons`: `ZodDefault`\<`ZodBoolean`\>; \}, `$strip`\>\>; `aliasToggle`: `ZodDefault`\<`ZodBoolean`\>; `binPath`: `ZodOptional`\<`ZodString`\>; `defaultJq`: `ZodOptional`\<`ZodString`\>; `autoDownloadWasm`: `ZodDefault`\<`ZodBoolean`\>; \}, `$strip`\>

Defined in: [types/index.ts:267](https://github.com/ray0404/jref/blob/6c03670428b40f584d834a3e0522dd2e7582a5ca/src/types/index.ts#L267)

Runtime schema for persistent jref configuration settings.
