# Fix: TypeScript Path Aliases Not Resolved in Vercel

## Problem

Vercel serverless functions were failing with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@shared/schema'
```

This error occurs because **TypeScript path aliases** (like `@shared/*`) are resolved during TypeScript compilation but **not at runtime** in Node.js.

## Root Cause

1. **TypeScript path aliases**: Our code used imports like `from "@shared/schema"` 
2. **Compile-time only**: TypeScript resolves these during compilation using `tsconfig.json` paths
3. **Runtime failure**: Node.js doesn't understand these aliases - it needs actual file paths
4. **Vercel limitation**: Vercel transpiles TypeScript but doesn't rewrite path aliases to relative paths

## Solution

Replace all TypeScript path aliases with **relative imports** using `.js` extensions.

### Files Modified

1. **`server/routes.ts`** - Changed `@shared/schema` → `../../shared/schema.js`
2. **`server/lib/openrouter.ts`** - Changed `@shared/schema` → `../../shared/schema.js`
3. **`server/agents/suggestionAgent.ts`** - Changed `@shared/agents` and `@shared/schema` → relative imports
4. **`shared/agents/index.ts`** - Added `.js` extension to relative import

### Example Changes

**Before:**
```typescript
import { enhancePromptSchema } from "@shared/schema";
import { suggestionAgentInputSchema } from "@shared/agents";
```

**After:**
```typescript
import { enhancePromptSchema } from "../../shared/schema.js";
import { suggestionAgentInputSchema } from "../../shared/agents/index.js";
```

## Why This Works

- **Relative paths work at runtime**: Node.js can resolve `../../shared/schema.js` 
- **`.js` extensions required**: ESM needs explicit extensions
- **TypeScript still type-checks**: TypeScript understands these imports and type-checks them
- **No runtime resolution needed**: Node.js directly resolves the file path

## Path Alias Mapping

| Path Alias | Relative Path (from `server/`) |
|------------|-------------------------------|
| `@shared/schema` | `../../shared/schema.js` |
| `@shared/agents` | `../../shared/agents/index.js` |
| `@shared/agents/index` | `../../shared/agents/index.js` |

## Important Notes

1. **Path aliases don't work at runtime** - They're a TypeScript-only feature
2. **Use relative imports for server code** - Only client code can use path aliases (if bundled)
3. **Always use `.js` extensions** - Required for ESM module resolution
4. **Calculate relative paths correctly** - Count directory levels (`../` for each level up)

## Alternative Solutions (Not Used)

1. **Use a bundler** - Could bundle server code, but adds complexity
2. **Use a runtime path resolver** - Could add a custom module resolver, but complex
3. **Keep aliases for client only** - Client code can use aliases if bundled by Vite

## Verification

After deploying, verify:
- ✅ `/api/health` endpoint works
- ✅ Enhancement features work
- ✅ No `ERR_MODULE_NOT_FOUND` errors for `@shared` packages
- ✅ All imports resolve correctly

## References

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Node.js ESM Module Resolution](https://nodejs.org/api/esm.html#esm_resolver_algorithm)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

