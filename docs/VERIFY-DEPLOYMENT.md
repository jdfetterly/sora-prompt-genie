# ✅ Verify and Fix Deployment

Your `OPENROUTER_API_KEY` is already set! Now let's make sure everything works.

## Step 1: Redeploy (Critical!)

Environment variables only apply to **new deployments**. Even though the variable is set, you need to redeploy:

### Option A: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Find your latest deployment
5. Click the **"..."** menu (three dots) on the right
6. Click **"Redeploy"**
7. Wait for deployment to complete

### Option B: Using Vercel Extension (Now that it's set up)
1. Open the Vercel sidebar (click the Vercel icon in left sidebar)
2. Find your project
3. Right-click on your project → Look for "Redeploy" or "Deploy"
4. Or use Command Palette: `Cmd+Shift+P` → Type "Vercel" → Look for deploy commands

### Option C: Using Git
```bash
git commit --allow-empty -m "Redeploy with environment variables"
git push
```

## Step 2: Check Deployment Status

After redeploying, verify:

1. **Check Deployment Status**:
   - In Vercel dashboard: Deployments → Check if latest shows "Ready" (green)
   - In extension: Check the sidebar for deployment status

2. **Test Your Site**:
   - Visit your deployment URL
   - Should load without 500 error
   - Test API: `https://your-site.vercel.app/api/health`

## Step 3: Check Function Logs (If Still Failing)

If it's still failing after redeploy:

### Using Dashboard:
1. Go to Deployments → Click on the latest deployment
2. Click **"Functions"** tab
3. Click on the function (usually `/api/index.ts`)
4. Check the **"Logs"** tab for error messages

### Using Extension:
1. Open Vercel sidebar
2. Right-click project → "View Logs" or "Open Logs"
3. Look for error messages

## Common Issues After Setting Variables

### "Still getting 500 error"
- ✅ Variable is set → Check if you redeployed
- ✅ Redeployed → Check function logs for specific error
- ✅ Checked logs → May be a different issue (see below)

### "Variable not found" errors in logs
- Verify variable name matches exactly: `OPENROUTER_API_KEY` (case-sensitive)
- Check it's set for the correct environment (Production/Preview)
- Make sure you redeployed after adding it

### Other errors in logs
- Check the specific error message
- Common issues:
  - Import errors (check `api/index.ts` paths)
  - Missing dependencies
  - Build configuration issues

## Step 4: Verify Extension is Working

Now that you've set up the VS Code Access Token:

1. **Open Vercel Sidebar**:
   - Click the Vercel icon in the left sidebar
   - You should see your projects listed

2. **Test Extension Features**:
   - View deployments
   - Check logs (right-click project → "View Logs")
   - Deploy new versions
   - View environment variables (if supported)

3. **If Extension Still Doesn't Work**:
   - The dashboard method works perfectly fine
   - Extension is optional - you can manage everything via dashboard
   - Check extension settings or reinstall if needed

## Success Checklist

- [x] `OPENROUTER_API_KEY` is set (✅ Done!)
- [x] VS Code Access Token configured (✅ Done!)
- [ ] **Redeployed after adding variable** ← Do this now!
- [ ] Deployment shows "Ready" status
- [ ] Site loads without errors
- [ ] API endpoints work (`/api/health`)

## Next Steps After Fix

Once your deployment is working:

1. Add recommended variables (if not already):
   - `NODE_ENV=production`
   - `SITE_URL` (your Vercel URL)
   - `ALLOWED_ORIGINS` (your Vercel URL)

2. Test all features:
   - Frontend loads correctly
   - API endpoints work
   - AI features work (test prompt generation)

3. Set up monitoring:
   - Check Vercel Analytics
   - Set up error tracking (if using Sentry)

