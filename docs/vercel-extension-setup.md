# Vercel Extension Setup Guide

This guide helps you set up the Vercel extension in Cursor/VS Code to manage your deployments and environment variables.

## Prerequisites

1. **Vercel Account**: You need a Vercel account (sign up at https://vercel.com)
2. **Vercel Extension**: Install the "Vercel" extension from the VS Code/Cursor marketplace
3. **Deployed Project**: Your project should already be deployed to Vercel (even if it's failing)

## Step 1: Authenticate with Vercel

The Vercel extension authentication varies by version. Try these methods:

**Method 1: Extension Sidebar**
1. Look for the Vercel icon in the left sidebar (looks like a triangle/Vercel logo)
2. Click it to open the Vercel panel
3. If you see a "Sign In" or "Login" button, click it
4. Follow the authentication flow in your browser

**Method 2: Command Palette (if available)**
1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Vercel" and see what commands appear
3. Look for commands like:
   - "Vercel: Sign In"
   - "Vercel: Authenticate"
   - "Vercel: Login"
   - Or similar variations

**Method 3: Use Dashboard Instead**
If the extension authentication doesn't work, you can manage everything through the web dashboard:
1. Go to https://vercel.com/dashboard
2. You're already logged in there
3. Use the dashboard for all operations (see Step 3)

## Step 2: Link Your Project (Optional)

**Note**: Linking is optional. You can manage everything through the dashboard without linking.

**If you want to link:**

1. **Using Extension Sidebar**:
   - Open the Vercel sidebar (click the Vercel icon)
   - Look for a "Link Project" button or option
   - Select your project from the list

2. **Using Command Palette** (if available):
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Vercel" and look for "Link" or "Connect" commands
   - Select your project

3. **Using Terminal** (Alternative):
   ```bash
   npx vercel link
   ```
   - This will prompt you to select your project
   - Creates a `.vercel` folder (gitignored)

**Skip this step** if you prefer to use the dashboard - it's not required!

## Step 3: Configure Environment Variables

This is the **most important step** to fix your deployment failure!

### Option A: Using Vercel Dashboard (Recommended - Most Reliable)

This method works 100% of the time and is the easiest:

1. Go to https://vercel.com/dashboard
2. Click on your project (the one that's failing)
3. Click **Settings** tab (top navigation)
4. Click **Environment Variables** in the left sidebar
5. Click **"Add New"** button

**Add Required Variable:**
- **Key**: `OPENROUTER_API_KEY`
- **Value**: Your OpenRouter API key (e.g., `sk-or-v1-...`)
- **Environment**: Select "Production", "Preview", and "Development" (or at least "Production")
- Click **"Save"**

**Add Recommended Variables:**

- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production only
- Click **"Save"**

- **Key**: `SITE_URL`
- **Value**: Your Vercel deployment URL (e.g., `https://sora-prompt-genie-xyz.vercel.app`)
- **Environment**: Production only
- Click **"Save"**

- **Key**: `ALLOWED_ORIGINS`
- **Value**: Your Vercel deployment URL (same as SITE_URL)
- **Environment**: Production only
- Click **"Save"**

### Option B: Using the Extension UI (If Available)

If your extension supports environment variable management:

1. **Open Vercel Sidebar**:
   - Click the Vercel icon in the left sidebar
   - You should see your project listed

2. **Access Environment Variables**:
   - Right-click on your project in the sidebar
   - Look for "Environment Variables", "Settings", or "Configure"
   - Or check if there's a settings icon next to your project

3. **Add Variables**:
   - Use the same variables as described in Option A above
   - Note: Extension UI may vary by version

## Step 4: Redeploy Your Project

After adding environment variables, you need to redeploy:

### Using the Dashboard (Easiest):

1. Go to your project in Vercel dashboard
2. Click on **"Deployments"** tab
3. Click the **"..."** menu on your latest deployment
4. Click **"Redeploy"**

### Using Git:

Simply push a new commit to trigger automatic deployment:
```bash
git commit --allow-empty -m "Trigger redeploy after env vars"
git push
```

## Step 5: Verify Deployment

1. **Check Deployment Status**:
   - In the Vercel extension sidebar, you should see deployment status
   - Or check the Vercel dashboard

2. **Test Your Site**:
   - Visit your deployment URL
   - The site should now load without the 500 error
   - Test API endpoints: `https://your-site.vercel.app/api/health`

3. **Check Logs** (if still having issues):
   - In Vercel extension: Right-click project → "View Logs"
   - Or in dashboard: Deployments → Click deployment → "Functions" tab → View logs

## Common Issues

### "Extension can't find my project" or "No login command"
- **Solution**: Use the Vercel dashboard instead - it's more reliable
- Go to https://vercel.com/dashboard and manage everything there
- The extension is optional - you don't need it to fix the deployment

### "Environment variables not working"
- **Important**: Environment variables only apply to NEW deployments
- After adding variables, you MUST redeploy
- Check that variables are set for the correct environment (Production/Preview)
- Verify variable names match exactly (case-sensitive)

### "Still getting 500 errors"
- Check Vercel function logs for specific error messages
- Verify `OPENROUTER_API_KEY` is set correctly
- Make sure you've redeployed after adding variables
- Check the deployment logs in Vercel dashboard

### "Can't see Environment Variables in extension" or "Extension commands don't work"
- **This is normal** - many extension versions don't support all features
- **Solution**: Use the Vercel dashboard - it always works
- Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- The dashboard method is actually easier and more reliable

## Extension Features

Once set up, the Vercel extension provides:

- **Deployments**: View and manage deployments
- **Logs**: View function logs directly in the editor
- **Environment Variables**: Manage env vars (if supported)
- **Domains**: View and manage custom domains
- **Quick Deploy**: Deploy with a single command

## Next Steps

After fixing the deployment:

1. ✅ Verify your site is working
2. ✅ Test API endpoints
3. ✅ Set up a custom domain (optional)
4. ✅ Configure preview deployments for pull requests
5. ✅ Set up monitoring and alerts

## Additional Resources

- [Vercel Extension Documentation](https://marketplace.visualstudio.com/items?itemName=vercel.vercel-vscode)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Quick Start Guide](./vercel-quick-start.md)
- [Environment Variables Reference](./environment-variables.md)

