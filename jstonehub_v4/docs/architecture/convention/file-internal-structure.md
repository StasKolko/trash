### File Internal Structure

```
1. Imports
2. Internal reusable types
3. Internal reusable constants
4. Main exported function #1
5.   Helpers for main #1
6. Main exported function #2
7.   Helpers for main #2
8. Shared helpers (used by multiple main functions)
9. Export statement (if needed)
```

Test files follow the same order: describe blocks as main content, helper types/constants at top after imports, helper functions at bottom

#### Export rules

| Situation | How to export |
|-----------|---------------|
| Single export, nothing else in file | `export` directly on declaration |
| Everything in file is exported | `export` directly on each declaration |
| Mix of public and private | Named `export { ... }` at bottom of file |