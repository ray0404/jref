🎯 **What:**
Added unit tests for the `getBlastRadius` function in `src/utils/dependency.ts`. The missing test cases have been thoroughly implemented to ensure `getBlastRadius` properly navigates the dependent graph up to the specified `maxDepth`.

📊 **Coverage:**
The following scenarios are now covered by unit tests:
- Direct dependents at depth 1.
- Transitive dependents at depth > 1.
- Excluding initially changed files from the result.
- Handling cyclic dependencies gracefully without infinite loops.
- Empty return when no dependents exist.
- Empty return when `changedFiles` is empty.
- Aggregation of dependents from multiple changed files.

✨ **Result:**
The `getBlastRadius` function is now well-tested, improving code reliability and protecting against regressions when maintaining the utility or refactoring related graph dependency traversal logic.
