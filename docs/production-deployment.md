# Production Deployment Guide

This guide provides step-by-step instructions for deploying SoraPromptGenie to production.

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed all security hardening tasks (see `production-readiness-plan.md`)
- ✅ Set up your production database (PostgreSQL/Neon)
- ✅ Obtained an OpenRouter API key
- ✅ Chosen a deployment platform
- ✅ Configured a domain name (optional but recommended)

## Pre-Deployment Checklist

### 1. Code Quality Checks

Run pre-deployment checks:

```bash
npm run predeploy
```

This runs:
- TypeScript type checking (`npm run check`)
- ESLint linting (`npm run lint`)
- Tests (`npm run test`)

### 2. Build Verification

Build the application:

```bash
npm run build
```

Verify the build output:
- `dist/index.js` - Server bundle
- `dist/public/` - Client static assets

### 3. Environment Variables

Ensure all required environment variables are configured:

**Required:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key

**Recommended for Production:**
- `NODE_ENV=production`
- `SITE_URL` - Your production URL (e.g., `https://sorapromptgenie.com`)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)

See `docs/environment-variables.md` for complete documentation.

### 4. Database Setup

1. **Create production database** (if not already created)
2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```
3. **Verify database connection** - Test connection with your `DATABASE_URL`

## Deployment Platforms

### Option 1: Railway

Railway is a simple platform for deploying Node.js applications.

#### Setup Steps:

1. **Install Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   ```

2. **Create Railway Project**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or use Railway CLI)

3. **Configure Environment Variables**:
   - In Railway dashboard, go to "Variables"
   - Add all required environment variables
   - Set `NODE_ENV=production`

4. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `/` (root)

5. **Deploy**:
   - Railway will automatically deploy on git push
   - Or use Railway CLI: `railway up`

6. **Configure Domain** (optional):
   - In Railway dashboard, go to "Settings" → "Domains"
   - Add your custom domain
   - Railway provides SSL automatically

### Option 2: Render

Render provides easy deployment with automatic SSL.

#### Setup Steps:

1. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up/login

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `sora-prompt-genie` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier available)

4. **Set Environment Variables**:
   - In "Environment" section, add all required variables
   - Set `NODE_ENV=production`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - First deployment may take 5-10 minutes

6. **Configure Custom Domain**:
   - Go to "Settings" → "Custom Domains"
   - Add your domain
   - Render provides SSL automatically

### Option 3: Vercel ✅ SELECTED

Vercel supports full-stack Express.js apps via serverless functions. Configuration files have been created:
- `vercel.json` - Vercel deployment configuration
- `api/index.ts` - Express.js serverless function handler

#### Setup Steps:

1. **Install Vercel CLI** (optional, can also use GitHub integration):
   ```bash
   npm i -g vercel
   ```

2. **Connect Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add all required variables:
     - `OPENROUTER_API_KEY` (required)
     - `NODE_ENV=production` (recommended)
     - `SITE_URL` (recommended - your production URL)
     - `ALLOWED_ORIGINS` (recommended - comma-separated CORS origins)
     - `DATABASE_URL` (if using database)
     - `SENTRY_DSN` (if using Sentry)

4. **Build Settings** (auto-configured via `vercel.json`):
   - Build Command: `npm run build` (runs automatically)
   - Output Directory: `dist/public` (for static assets)
   - Framework Preset: Other (Express.js)

5. **Deploy**:
   - **Via CLI**: `vercel --prod`
   - **Via GitHub**: Push to main branch (auto-deploys if configured)
   - **Via Dashboard**: Click "Deploy" button

6. **Configure Custom Domain** (optional):
   - In Vercel dashboard, go to "Settings" → "Domains"
   - Add your custom domain
   - Vercel automatically provisions SSL certificate

#### Vercel-Specific Notes:

- **Serverless Functions**: Express.js app runs as a serverless function via `api/index.ts`
- **Static Assets**: Frontend static files are served from `dist/public`
- **Automatic SSL**: Vercel provides free SSL certificates for all domains
- **Global CDN**: All assets are automatically distributed via Vercel's CDN
- **Environment Variables**: Set per-environment (production, preview, development)
- **Function Timeout**: Default 10 seconds (can be increased in Pro plan)
- **Cold Starts**: First request may be slower due to serverless nature

#### Troubleshooting:

- **Build Errors**: Check Vercel build logs in dashboard
- **Environment Variables**: Ensure all required vars are set in Vercel dashboard
- **API Routes Not Working**: Verify `vercel.json` routes configuration
- **Static Files Not Serving**: Check that `dist/public` contains built assets

### Option 4: AWS/EC2

For more control, deploy to AWS EC2.

#### Setup Steps:

1. **Launch EC2 Instance**:
   - Choose Ubuntu or Amazon Linux
   - Configure security groups (open port 5000 or 80/443)
   - Allocate Elastic IP (optional)

2. **SSH into Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**:
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

4. **Clone and Setup**:
   ```bash
   git clone your-repo-url
   cd SoraPromptGenie
   npm install
   ```

5. **Configure Environment**:
   ```bash
   # Create .env file
   nano .env
   # Add all required environment variables
   ```

6. **Build and Start**:
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Configure PM2 to start on boot
   ```

7. **Configure Nginx** (recommended):
   - Install Nginx: `sudo apt install nginx`
   - Configure reverse proxy to port 5000
   - Set up SSL with Let's Encrypt

## Post-Deployment Verification

### 1. Health Check

Verify the health endpoint is working:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "environment": "production"
}
```

### 2. Test API Endpoints

Test key endpoints:

```bash
# Test enhance-prompt endpoint
curl -X POST https://your-domain.com/api/enhance-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "enhancements": []}'
```

### 3. Check Logs

Monitor application logs:

**If using PM2:**
```bash
pm2 logs sora-prompt-genie
```

**If using Railway:**
- View logs in Railway dashboard

**If using Render:**
- View logs in Render dashboard

**File logs:**
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### 4. Monitor Error Tracking

- Check Sentry dashboard for any errors
- Verify error tracking is working correctly

### 5. Test Frontend

- Visit your production URL
- Test key user flows:
  - Create a prompt
  - Use auto-generate
  - Apply enhancements
  - Switch between simple/advanced modes

## Monitoring Setup

### 1. Uptime Monitoring

Set up uptime monitoring with:
- **UptimeRobot**: Monitor `/api/health` endpoint every 5 minutes
- **Pingdom**: Monitor your domain
- **StatusCake**: Free uptime monitoring

### 2. Application Monitoring

Consider setting up:
- **New Relic**: APM monitoring
- **Datadog**: Full observability stack
- **LogRocket**: Session replay and logging

### 3. Log Aggregation

For production, consider:
- **Datadog Logs**: Centralized log management
- **CloudWatch**: If using AWS
- **Papertrail**: Simple log aggregation

## SSL/HTTPS Setup

### Automatic SSL (Recommended)

Most platforms provide automatic SSL:
- **Railway**: Automatic SSL for custom domains
- **Render**: Automatic SSL for all services
- **Vercel**: Automatic SSL

### Manual SSL (EC2/Self-Hosted)

Use Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Backups

### Neon (Serverless PostgreSQL)

Neon provides automatic backups:
- Point-in-time recovery available
- Configure backup retention in Neon dashboard

### Self-Managed PostgreSQL

Set up automated backups:

```bash
# Add to crontab
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql
```

## Scaling Considerations

### Horizontal Scaling

The application is stateless and can be scaled horizontally:

1. **Multiple Instances**: Run multiple PM2 instances or use platform scaling
2. **Load Balancer**: Use Nginx or platform load balancer
3. **Database Connection Pooling**: Neon handles this automatically

### PM2 Cluster Mode

To use PM2 cluster mode, update `ecosystem.config.js`:

```javascript
instances: "max", // Use all CPU cores
exec_mode: "cluster", // Cluster mode
```

## Rollback Procedure

If deployment causes issues:

### Railway/Render

1. Go to deployment history
2. Select previous successful deployment
3. Click "Rollback" or redeploy previous version

### PM2/EC2

1. **Revert code**:
   ```bash
   git checkout previous-commit-hash
   npm run build
   pm2 restart ecosystem.config.js
   ```

2. **Or restore from backup**:
   ```bash
   # Restore database
   psql $DATABASE_URL < backup.sql
   ```

## Troubleshooting

### Application Won't Start

1. Check environment variables are set correctly
2. Verify database connection
3. Check logs: `pm2 logs` or platform logs
4. Verify port is not already in use

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is accessible from deployment server
3. Verify database credentials
4. Check firewall/security group settings

### Build Failures

1. Check Node.js version (requires 18+)
2. Verify all dependencies install correctly
3. Check for TypeScript errors: `npm run check`
4. Review build logs for specific errors

### High Memory Usage

1. Check for memory leaks
2. Reduce PM2 memory limit if needed
3. Consider upgrading instance size
4. Review application logs for issues

## Security Checklist

Before going live, verify:

- ✅ All environment variables are set securely (not in code)
- ✅ CORS is configured correctly
- ✅ Rate limiting is enabled
- ✅ Security headers are configured (Helmet)
- ✅ Error messages don't expose sensitive information
- ✅ SSL/HTTPS is enabled
- ✅ Database credentials are secure
- ✅ API keys are rotated regularly

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check logs regularly for errors
2. **Update Dependencies**: Keep dependencies up to date
3. **Database Backups**: Verify backups are running
4. **Security Updates**: Apply security patches promptly
5. **Performance Monitoring**: Monitor response times and error rates

### Updates

To deploy updates:

1. Push changes to main branch
2. Platform will auto-deploy (if configured)
3. Or manually trigger deployment
4. Monitor logs and health endpoint
5. Verify functionality

## Support

For issues or questions:
- Check logs first
- Review `docs/runbook.md` for common issues
- Check Sentry for error tracking
- Review `docs/production-readiness-plan.md` for production checklist

