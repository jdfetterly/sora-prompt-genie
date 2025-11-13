# Fix: ESM Module Resolution Errors in Vercel

## Problem

Vercel serverless functions were failing with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/routes'
```

This error occurs because Node.js ESM (ECMAScript Modules) requires **explicit file extensions** (`.js`) for relative imports when using TypeScript files that are transpiled to JavaScript.

## Root Cause

According to the [Vercel FUNCTION_INVOCATION_FAILED documentation](https://vercel.com/docs/errors/FUNCTION_INVOCATION_FAILED), this error occurs when:
- The runtime process crashes
- There are unhandled exceptions

In our case:
1. **TypeScript imports without extensions**: Our code used imports like `from "../server/routes"` 
2. **ESM requirement**: When TypeScript is transpiled to JavaScript, Node.js ESM requires `.js` extensions for relative imports
3. **Runtime resolution failure**: Vercel tries to resolve these imports at runtime but can't find the modules because the extensions are missing

## Solution

Add `.js` extensions to all relative imports in TypeScript files that will be used by Vercel serverless functions.

### Files Modified

1. **`api/index.ts`** - Added `.js` extensions to all server imports
2. **`server/routes.ts`** - Added `.js` extensions to relative imports
3. **`server/utils/errorFormatter.ts`** - Added `.js` extension to logger import
4. **`server/lib/openrouter.ts`** - Added `.js` extensions to relative imports
5. **`server/agents/suggestionAgent.ts`** - Added `.js` extensions to relative imports

### Example Changes

**Before:**
```typescript
import { registerRoutes } from "../server/routes";
import { logger } from "./utils/logger";
```

**After:**
```typescript
import { registerRoutes } from "../server/routes.js";
import { logger } from "./utils/logger.js";
```

## Why This Works

- **TypeScript allows imports without extensions** - TypeScript's module resolution handles this during compilation
- **Node.js ESM requires extensions** - When the code runs in Node.js, ESM needs explicit extensions
- **Vercel transpiles TypeScript** - Vercel transpiles `.ts` to `.js`, but the import statements remain as-is
- **Adding `.js` extensions** - Even though the source files are `.ts`, we use `.js` in imports because that's what they'll be after transpilation

## Important Notes

1. **Only relative imports need extensions** - Imports from `node_modules` or path aliases (like `@shared/*`) don't need extensions
2. **Use `.js` not `.ts`** - Always use `.js` extensions in imports, even for TypeScript files
3. **TypeScript still type-checks** - TypeScript understands that `.js` imports refer to `.ts` files
4. **This is an ESM requirement** - CommonJS (`require`) doesn't need extensions, but ESM (`import`) does

## Verification

After deploying, verify:
- ✅ `/api/health` endpoint works
- ✅ Enhancement features work
- ✅ No `ERR_MODULE_NOT_FOUND` errors in logs

## References

- [Vercel FUNCTION_INVOCATION_FAILED Docs](https://vercel.com/docs/errors/FUNCTION_INVOCATION_FAILED)
- [Node.js ESM Module Resolution](https://nodejs.org/api/esm.html#esm_resolver_algorithm)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

