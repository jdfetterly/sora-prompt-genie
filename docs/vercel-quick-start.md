# Vercel Quick Start - Step by Step

## Initial Deployment (Minimal Setup)

### Step 1: Basic Configuration
On the "New Project" screen:

1. **Framework Preset**: Select `Vite` (or `Other`)
2. **Root Directory**: Leave as `./`
3. **Build Command**: Set to `npm run build`
4. **Output Directory**: Set to `dist/public`
5. **Install Command**: Set to `npm install`

### Step 2: Minimum Environment Variables

**If the Environment Variables section is visible:**
- Click to expand it
- Add ONLY the required variable for now:
  - **Key**: `OPENROUTER_API_KEY`
  - **Value**: Your OpenRouter API key

**If Environment Variables section is NOT visible:**
- That's okay! You can add them after deployment
- Just click "Deploy" to proceed

### Step 3: Deploy
Click the **"Deploy"** button and wait for deployment to complete.

## After First Deployment

### Step 4: Add Environment Variables

1. **Go to Project Settings**:
   - In your Vercel dashboard, click on your project
   - Click **"Settings"** tab (top navigation)
   - Click **"Environment Variables"** in the left sidebar

2. **Add Required Variable** (if not added during setup):
   - Click **"Add New"** or **"Add"** button
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: Your OpenRouter API key
   - **Environment**: Select "Production", "Preview", and "Development" (or just "Production" for now)
   - Click **"Save"**

3. **Add Recommended Variables**:
   
   Click "Add New" for each:
   
   **Variable 1:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production only
   
   **Variable 2:**
   - **Key**: `SITE_URL`
   - **Value**: `https://sora-prompt-genie.vercel.app` (replace with your actual Vercel URL)
   - **Environment**: Production only
   
   **Variable 3:**
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://sora-prompt-genie.vercel.app` (replace with your actual Vercel URL)
   - **Environment**: Production only

4. **Redeploy**:
   - After adding environment variables, go to **"Deployments"** tab
   - Click the **"..."** menu on your latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger automatic redeployment

## Quick Reference: Where to Find Settings

### During Initial Setup:
- **Build Settings**: Expand "Build and Output Settings" section
- **Environment Variables**: Expand "Environment Variables" section (if visible)

### After Deployment:
- **Project Settings**: Click project → "Settings" tab
- **Environment Variables**: Settings → "Environment Variables" (left sidebar)
- **Build Settings**: Settings → "General" → Scroll to "Build & Development Settings"
- **Domains**: Settings → "Domains" (left sidebar)

## Troubleshooting

**"I don't see Environment Variables section"**
- That's normal! Add them after deployment in Project Settings

**"Where do I find my Vercel URL?"**
- After deployment, it's shown on the deployment page
- Format: `https://your-project-name.vercel.app`
- Also visible in: Settings → "Domains"

**"Do I need to redeploy after adding variables?"**
- Yes, environment variables are only available to new deployments
- Either redeploy manually or push a new commit

