# Fix: Module Resolution Error in Vercel

## Problem

The Vercel serverless function was failing with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/utils/sentry'
```

This was causing `FUNCTION_INVOCATION_FAILED` errors when trying to use the enhancement features.

## Root Cause

Vercel was trying to resolve the `sentry` module during function initialization, but the module wasn't being found in the deployed bundle. This could happen due to:
1. Module bundling issues in Vercel's build process
2. TypeScript module resolution not working correctly
3. The module not being included in the serverless function bundle

## Solution

We've made the Sentry import **optional and resilient** so the app continues to work even if Sentry can't be loaded:

### Changes Made

1. **`api/index.ts`**: Changed Sentry import to use dynamic import with error handling
   - Sentry initialization now happens asynchronously in the background
   - If Sentry fails to load, the app continues without it (Sentry is optional)

2. **`server/utils/errorFormatter.ts`**: Made Sentry usage conditional
   - Uses lazy loading pattern for Sentry
   - Only tries to capture errors if Sentry is available
   - Gracefully handles cases where Sentry module isn't found

3. **`vercel.json`**: Added explicit function configuration
   - Specified `@vercel/node@3` runtime for the serverless function
   - This helps Vercel properly handle TypeScript and module resolution

## Files Modified

- `api/index.ts` - Made Sentry import resilient
- `server/utils/errorFormatter.ts` - Made Sentry usage conditional
- `vercel.json` - Added function runtime configuration

## Next Steps

1. **Commit and push** these changes:
   ```bash
   git add api/index.ts server/utils/errorFormatter.ts vercel.json
   git commit -m "Fix: Make Sentry import resilient for Vercel deployment"
   git push
   ```

2. **Redeploy** on Vercel (should happen automatically on push)

3. **Verify** the fix:
   - Check that `/api/health` endpoint works
   - Try applying a camera angle enhancement
   - Check Vercel function logs to ensure no module resolution errors

## Expected Behavior

- ✅ App should work even if Sentry module can't be resolved
- ✅ Enhancement features should work normally
- ✅ Error logging will still work (via Winston logger)
- ✅ Sentry error tracking will work if the module loads successfully

## If Issues Persist

If you still see module resolution errors:

1. **Check Vercel Build Logs**:
   - Go to Vercel Dashboard → Deployments → Latest → Build Logs
   - Look for any TypeScript compilation errors

2. **Verify Build Command**:
   - Ensure `npm run build` completes successfully
   - Check that all TypeScript files compile without errors

3. **Check Function Logs**:
   - Vercel Dashboard → Deployments → Latest → Functions → Logs
   - Look for any runtime errors

4. **Verify Environment Variables**:
   - Ensure `OPENROUTER_API_KEY` is set in Vercel
   - Check that `SENTRY_DSN` is set if you want Sentry (optional)

## Notes

- Sentry is now **optional** - the app will work without it
- Error logging still works via Winston logger
- The app will gracefully degrade if Sentry can't be loaded
- This makes the deployment more resilient to module resolution issues

