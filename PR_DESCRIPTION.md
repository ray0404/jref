🧪 [Testing] Increase test coverage for `path-resolver.ts` to 100%

🎯 **What:** The testing gap in `src/utils/path-resolver.ts` was addressed. The tests previously had gaps in evaluating parsing string outputs from unclosed brackets, missing quotes, initial dot-quotes, and resetting variables correctly on false values.
📊 **Coverage:** Increased the coverage from roughly 96% lines previously tested to 100% lines, functions, statements, and branches tested. Added test blocks dealing directly with `describe('parsePath edge cases')`, `describe('getValueByPath edge cases')`, `describe('setValueByPath edge cases')`, and `describe('parsePath with dot-quoted edge case')`.
✨ **Result:** Test coverage for `src/utils/path-resolver.ts` is now at 100% and can safely handle all possible parsing and resolving variables scenarios.
