# Vercel Deployment Setup Guide

This guide provides step-by-step instructions for configuring your Vercel project settings.

## Project Configuration

### 1. Basic Settings

In the Vercel "New Project" screen:

- **Vercel Team**: Select your team (Hobby plan is fine for starting)
- **Project Name**: `sora-prompt-genie` (or your preferred name)
- **Framework Preset**: 
  - Select `Vite` (this is fine - `vercel.json` handles the Express.js routing)
  - OR select `Other` if you prefer (both work the same)
- **Root Directory**: `./` (leave as default - project root)

### 2. Build and Output Settings

Expand the "Build and Output Settings" section and configure:

- **Build Command**: 
  ```
  npm run build
  ```
  This builds both the Vite frontend and the Express.js backend.

- **Output Directory**: 
  ```
  dist/public
  ```
  This is where Vite outputs the static frontend assets.

- **Install Command**: 
  ```
  npm install
  ```
  (or `yarn install`, `pnpm install`, `bun install` depending on your package manager)

### 3. Environment Variables

**Option A: Add During Setup (if section is visible)**
- Expand the "Environment Variables" section on the "New Project" screen
- Click "+ Add More" to add each variable
- Add the Key and Value for each variable

**Option B: Add After Deployment (Recommended)**
If the Environment Variables section isn't visible or you want to add them later:
1. Complete the initial deployment first (click "Deploy" with just the required `OPENROUTER_API_KEY` if needed)
2. After deployment, go to your project dashboard
3. Click "Settings" → "Environment Variables"
4. Add variables there (you can set them for Production, Preview, and Development environments)

**Required Variables to Add:**

#### Required Variables:

1. **`OPENROUTER_API_KEY`**
   - **Value**: Your OpenRouter API key (e.g., `sk-or-v1-...`)
   - **Description**: Required for AI-powered prompt generation
   - **How to get**: Sign up at https://openrouter.ai/ and generate an API key

#### Recommended Variables:

2. **`NODE_ENV`**
   - **Value**: `production`
   - **Description**: Sets the Node.js environment to production mode

3. **`SITE_URL`**
   - **Value**: Your Vercel deployment URL (e.g., `https://sora-prompt-genie.vercel.app`)
   - **Description**: Used for CORS and API referrer headers
   - **Note**: You can update this after deployment with your custom domain

4. **`ALLOWED_ORIGINS`**
   - **Value**: Your Vercel URL(s), comma-separated (e.g., `https://sora-prompt-genie.vercel.app,https://www.sora-prompt-genie.vercel.app`)
   - **Description**: Comma-separated list of allowed CORS origins
   - **Note**: Update this when you add a custom domain

#### Optional Variables:

5. **`DATABASE_URL`** (if using database)
   - **Value**: Your Neon PostgreSQL connection string
   - **Description**: Database connection URL

6. **`SENTRY_DSN`** (if using Sentry)
   - **Value**: Your Sentry DSN
   - **Description**: Sentry error tracking DSN

7. **`OPENROUTER_MODEL`** (optional)
   - **Value**: `google/gemini-2.5-flash-lite` (default)
   - **Description**: AI model to use for prompt generation
   - **Options**: See `docs/environment-variables.md` for available models

### 4. Environment-Specific Variables

After initial deployment, you can set variables per environment:

- **Production**: Variables for production deployments
- **Preview**: Variables for preview deployments (pull requests)
- **Development**: Variables for local development (optional)

To set environment-specific variables:
1. Go to Project Settings → Environment Variables
2. Add variables and select which environments they apply to

## Deployment

Once all settings are configured:

1. Click the **"Deploy"** button
2. Vercel will:
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Deploy the application
3. You'll get a deployment URL like: `https://sora-prompt-genie.vercel.app`

## Post-Deployment

### 1. Update SITE_URL

After deployment, update the `SITE_URL` environment variable with your actual deployment URL:

1. Go to Project Settings → Environment Variables
2. Edit `SITE_URL` to match your deployment URL
3. Redeploy (or wait for next deployment)

### 2. Test the Deployment

Test your deployment:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "uptime": ...,
#   "environment": "production"
# }
```

### 3. Add Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate
5. Update `SITE_URL` and `ALLOWED_ORIGINS` with your custom domain

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json`

### API Routes Not Working

- Verify `vercel.json` is in the project root
- Check that `api/index.ts` exists
- Review Vercel function logs in dashboard

### Environment Variables Not Working

- Ensure variables are set in Vercel dashboard (not just `.env` file)
- Check variable names match exactly (case-sensitive)
- Verify variables are set for the correct environment (Production/Preview)

### Static Files Not Loading

- Verify `dist/public` directory exists after build
- Check Output Directory setting matches `dist/public`
- Review build logs to ensure Vite build completed successfully

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](docs/environment-variables.md)
- [Production Deployment Guide](docs/production-deployment.md)

