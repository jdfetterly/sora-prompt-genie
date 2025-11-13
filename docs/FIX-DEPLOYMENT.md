# 🚨 Quick Fix: Vercel Deployment Failure

Your deployment is failing because **required environment variables are missing**. Follow these steps to fix it.

## ✅ Step-by-Step Fix

### 1. Add Environment Variables in Vercel

**Option A: Using Vercel Dashboard (Recommended - Most Reliable)**

This is the easiest and most reliable method:

1. Go to https://vercel.com/dashboard
2. Click on your project (the one that's failing)
3. Click **Settings** tab (top navigation)
4. Click **Environment Variables** in the left sidebar
5. Click **"Add New"** button
6. Add each variable:

   **Required Variable:**
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: Your OpenRouter API key (e.g., `sk-or-v1-...`)
   - **Environment**: Select "Production", "Preview", and "Development" (or at least "Production")
   - Click **"Save"**
   
   **Recommended Variables** (add these too):
   
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production only
   - Click **"Save"**
   
   - **Key**: `SITE_URL`
   - **Value**: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
   - **Environment**: Production only
   - Click **"Save"**
   
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: Your Vercel deployment URL (same as SITE_URL)
   - **Environment**: Production only
   - Click **"Save"**

**Option B: Using Vercel Extension (If Available)**

If you have the Vercel extension installed and it's working:
1. Look for the Vercel icon in the left sidebar
2. Click it to open the Vercel panel
3. You may need to sign in through the extension UI
4. Right-click on your project → Look for "Settings" or "Environment Variables"
5. Add variables as described above

**Note**: Extension commands vary by version. If commands don't work, use the dashboard method above.

### 2. Redeploy Your Project

**After adding environment variables, you MUST redeploy:**

**Using Dashboard (Easiest):**
- Go to Deployments → Click "..." on latest → "Redeploy"

**Using Git:**
```bash
git commit --allow-empty -m "Redeploy with env vars"
git push
```

### 3. Verify It's Working

1. Wait for deployment to complete (check status in extension or dashboard)
2. Visit your site URL
3. It should load without the 500 error
4. Test API: `https://your-site.vercel.app/api/health`

## 🔍 What Was Wrong?

The error `FUNCTION_INVOCATION_FAILED` happened because:
- ✅ Code deployed successfully
- ❌ Missing `OPENROUTER_API_KEY` environment variable
- ❌ Serverless function crashed on startup when validating environment

## 📚 More Help

- **Detailed Extension Setup**: See `docs/vercel-extension-setup.md`
- **Environment Variables Guide**: See `docs/environment-variables.md`
- **Vercel Quick Start**: See `docs/vercel-quick-start.md`

## 🆘 Still Having Issues?

1. **Check Function Logs**:
   - Extension: Right-click project → "View Logs"
   - Dashboard: Deployments → Click deployment → "Functions" → Logs

2. **Verify Variables**:
   - Names must match exactly (case-sensitive)
   - Values must be correct (no extra spaces)
   - Must be set for the correct environment

3. **Common Mistakes**:
   - ❌ Forgot to redeploy after adding variables
   - ❌ Variables set for wrong environment
   - ❌ Typos in variable names
   - ❌ Missing API key value

## ✅ Success Checklist

- [ ] `OPENROUTER_API_KEY` added to Production environment in Vercel dashboard
- [ ] `NODE_ENV=production` added (recommended)
- [ ] `SITE_URL` added with your Vercel URL (recommended)
- [ ] `ALLOWED_ORIGINS` added with your Vercel URL (recommended)
- [ ] Redeployed after adding variables
- [ ] Site loads without errors
- [ ] API endpoints work correctly

