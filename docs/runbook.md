# Operational Runbook

This runbook provides procedures for common operational tasks and troubleshooting for SoraPromptGenie in production.

## Table of Contents

- [Health Checks](#health-checks)
- [Common Issues](#common-issues)
- [Deployment Procedures](#deployment-procedures)
- [Database Operations](#database-operations)
- [Monitoring & Logs](#monitoring--logs)
- [Incident Response](#incident-response)
- [Maintenance Tasks](#maintenance-tasks)

## Health Checks

### Check Application Status

```bash
# Health check endpoint
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### Check Process Status (PM2)

```bash
# Status of all processes
pm2 status

# Detailed info
pm2 describe sora-prompt-genie

# Monitor in real-time
pm2 monit
```

### Check Database Connection

```bash
# Test database connection (if psql available)
psql $DATABASE_URL -c "SELECT 1;"
```

## Common Issues

### Issue: Application Won't Start

**Symptoms:**
- Process exits immediately
- Health check returns 503/500
- No logs appearing

**Diagnosis Steps:**

1. **Check Environment Variables**:
   ```bash
   # Verify required vars are set
   echo $OPENROUTER_API_KEY
   echo $DATABASE_URL
   echo $NODE_ENV
   ```

2. **Check Logs**:
   ```bash
   # PM2 logs
   pm2 logs sora-prompt-genie --lines 100
   
   # File logs
   tail -f logs/error.log
   tail -f logs/combined.log
   ```

3. **Check Port Availability**:
   ```bash
   # Check if port is in use
   lsof -i :5000
   # Or
   netstat -tulpn | grep 5000
   ```

**Solutions:**

- **Missing Environment Variables**: Set required variables and restart
- **Port Already in Use**: Change PORT env var or kill process using port
- **Database Connection Failed**: Verify DATABASE_URL and database accessibility
- **Build Issues**: Rebuild application: `npm run build`

### Issue: High Error Rate

**Symptoms:**
- Many 500 errors in logs
- Sentry showing errors
- Users reporting issues

**Diagnosis Steps:**

1. **Check Error Logs**:
   ```bash
   tail -f logs/error.log
   ```

2. **Check Sentry Dashboard**:
   - Review recent errors
   - Check error frequency
   - Review error details

3. **Check API Response Times**:
   ```bash
   # Monitor response times
   curl -w "@-" -o /dev/null -s https://your-domain.com/api/health <<'EOF'
   time_namelookup:  %{time_namelookup}\n
   time_connect:  %{time_connect}\n
   time_total:  %{time_total}\n
   EOF
   ```

**Common Causes & Solutions:**

- **OpenRouter API Issues**: Check OpenRouter status, verify API key
- **Database Connection Issues**: Check database status, connection pool
- **Rate Limiting**: Check if hitting rate limits, review rate limit config
- **Memory Issues**: Check memory usage, restart if needed

### Issue: Slow Response Times

**Symptoms:**
- API responses taking >5 seconds
- Users reporting slowness
- High latency metrics

**Diagnosis Steps:**

1. **Check Application Logs**:
   ```bash
   # Look for slow requests
   grep "in [0-9]\{4,\}ms" logs/combined.log
   ```

2. **Check Database Performance**:
   ```bash
   # If using Neon, check dashboard
   # Look for slow queries
   ```

3. **Check OpenRouter API Latency**:
   - Review logs for OpenRouter response times
   - Check OpenRouter status page

**Solutions:**

- **Database Slow**: Optimize queries, check indexes, consider connection pooling
- **OpenRouter Slow**: Check OpenRouter status, consider different model
- **High Load**: Scale horizontally (add more instances)
- **Memory Issues**: Check memory usage, restart if needed

### Issue: Database Connection Errors

**Symptoms:**
- "Connection refused" errors
- "Connection timeout" errors
- Database queries failing

**Diagnosis Steps:**

1. **Test Database Connection**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Check Database Status**:
   - If using Neon: Check Neon dashboard
   - Verify database is running
   - Check connection limits

3. **Check Network/Firewall**:
   - Verify deployment server can reach database
   - Check security groups/firewall rules

**Solutions:**

- **Connection String Wrong**: Verify DATABASE_URL format
- **Database Down**: Check database provider status
- **Connection Limit Reached**: Check connection pooling, reduce connections
- **Network Issues**: Verify firewall rules, network connectivity

### Issue: Rate Limiting Errors

**Symptoms:**
- 429 Too Many Requests errors
- Users reporting "rate limit exceeded"
- API calls failing

**Diagnosis Steps:**

1. **Check Rate Limit Logs**:
   ```bash
   grep "rate limit" logs/combined.log
   ```

2. **Review Rate Limit Configuration**:
   - Check `server/middleware/rateLimit.ts`
   - Verify limits are appropriate

**Solutions:**

- **Too Strict**: Adjust rate limits if legitimate users are blocked
- **DDoS Attack**: Check for suspicious patterns, consider stricter limits
- **OpenRouter Rate Limits**: Check OpenRouter API rate limits

## Deployment Procedures

### Standard Deployment

1. **Pre-Deployment Checks**:
   ```bash
   npm run predeploy
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Deploy** (platform-specific):
   - **Railway/Render**: Push to main branch (auto-deploys)
   - **PM2**: `pm2 restart ecosystem.config.js`

4. **Verify Deployment**:
   ```bash
   # Check health endpoint
   curl https://your-domain.com/api/health
   
   # Check logs
   pm2 logs sora-prompt-genie --lines 50
   ```

5. **Monitor**:
   - Watch logs for errors
   - Check Sentry for new errors
   - Monitor health endpoint

### Rollback Procedure

**If deployment causes issues:**

1. **Railway/Render**:
   - Go to deployment history
   - Select previous successful deployment
   - Click "Rollback"

2. **PM2/Git**:
   ```bash
   # Revert to previous commit
   git checkout previous-commit-hash
   npm run build
   pm2 restart ecosystem.config.js
   ```

3. **Database Rollback** (if schema changed):
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   ```

### Emergency Hotfix

1. **Create Hotfix Branch**:
   ```bash
   git checkout -b hotfix/issue-description
   ```

2. **Make Fix**:
   - Fix the issue
   - Test locally if possible

3. **Deploy**:
   ```bash
   npm run build
   pm2 restart ecosystem.config.js
   ```

4. **Verify**:
   - Check health endpoint
   - Monitor logs
   - Verify fix works

5. **Merge to Main**:
   ```bash
   git checkout main
   git merge hotfix/issue-description
   git push
   ```

## Database Operations

### Backup Database

**Neon (Automatic)**:
- Neon provides automatic backups
- Point-in-time recovery available
- Check Neon dashboard for backup status

**Manual Backup**:
```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Compress backup
gzip backup-*.sql
```

### Restore Database

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or compressed
gunzip < backup.sql.gz | psql $DATABASE_URL
```

### Run Migrations

```bash
# Generate migration (development)
npm run db:generate

# Apply migration (production)
npm run db:migrate

# Verify migration
npm run db:studio  # Open Drizzle Studio
```

### Check Database Size

```sql
-- Connect to database
psql $DATABASE_URL

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Monitoring & Logs

### View Logs

**PM2 Logs**:
```bash
# All logs
pm2 logs sora-prompt-genie

# Last 100 lines
pm2 logs sora-prompt-genie --lines 100

# Error logs only
pm2 logs sora-prompt-genie --err

# Follow logs
pm2 logs sora-prompt-genie --follow
```

**File Logs**:
```bash
# Combined log
tail -f logs/combined.log

# Error log
tail -f logs/error.log

# Search logs
grep "error" logs/combined.log
grep "ERROR" logs/error.log

# Last 100 lines
tail -n 100 logs/combined.log
```

### Monitor Performance

**PM2 Monitoring**:
```bash
# Real-time monitoring
pm2 monit

# Process info
pm2 describe sora-prompt-genie
```

**Check Resource Usage**:
```bash
# CPU and memory
top
# Or
htop

# Process-specific
pm2 describe sora-prompt-genie | grep memory
```

### Sentry Error Tracking

1. **Access Sentry Dashboard**:
   - Go to your Sentry project
   - Review recent errors
   - Check error frequency and trends

2. **Common Error Types**:
   - **OpenRouter API Errors**: Check API key, rate limits
   - **Database Errors**: Check connection, query issues
   - **Validation Errors**: Check request format

## Incident Response

### Severity Levels

**P0 - Critical**:
- Application completely down
- Data loss or corruption
- Security breach

**P1 - High**:
- Major functionality broken
- High error rate (>10%)
- Performance degradation

**P2 - Medium**:
- Minor functionality issues
- Some users affected
- Non-critical errors

**P3 - Low**:
- Cosmetic issues
- Minor performance issues
- Non-blocking errors

### Incident Response Process

1. **Acknowledge**:
   - Acknowledge the incident
   - Assess severity
   - Notify team if needed

2. **Investigate**:
   - Check health endpoint
   - Review logs
   - Check Sentry for errors
   - Review monitoring dashboards

3. **Mitigate**:
   - Apply quick fix if possible
   - Restart application if needed
   - Rollback if deployment issue

4. **Resolve**:
   - Fix root cause
   - Verify fix works
   - Monitor for recurrence

5. **Post-Mortem**:
   - Document incident
   - Identify root cause
   - Plan prevention measures

### Common Incident Scenarios

**Scenario 1: Application Down**

1. Check health endpoint
2. Check process status (PM2 or platform)
3. Check logs for errors
4. Restart if needed
5. If persists, check environment variables and database

**Scenario 2: High Error Rate**

1. Check Sentry for error patterns
2. Review error logs
3. Check OpenRouter API status
4. Check database status
5. Apply fix or rollback

**Scenario 3: Performance Degradation**

1. Check response times
2. Review slow queries
3. Check resource usage (CPU, memory)
4. Check for memory leaks
5. Scale if needed

## Maintenance Tasks

### Daily

- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Check Sentry for new errors
- [ ] Monitor response times

### Weekly

- [ ] Review application logs
- [ ] Check database size and performance
- [ ] Review error trends
- [ ] Check dependency updates
- [ ] Review security alerts

### Monthly

- [ ] Review and update dependencies
- [ ] Check database backups
- [ ] Review and optimize queries
- [ ] Security audit
- [ ] Performance review
- [ ] Update documentation

### Quarterly

- [ ] Full security audit
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Review and update runbook
- [ ] Capacity planning

## Useful Commands

### Application Management

```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop sora-prompt-genie

# Restart application
pm2 restart sora-prompt-genie

# Reload (zero-downtime)
pm2 reload sora-prompt-genie

# Delete from PM2
pm2 delete sora-prompt-genie

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Log Management

```bash
# Clear PM2 logs
pm2 flush

# Rotate logs (if using logrotate)
logrotate -f /etc/logrotate.d/pm2

# Archive old logs
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/
```

### Database Management

```bash
# Connect to database
psql $DATABASE_URL

# List tables
psql $DATABASE_URL -c "\dt"

# Check connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Kill long-running queries
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';"
```

## Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Infrastructure Team**: [Contact Info]
- **OpenRouter Support**: https://openrouter.ai/docs

## Additional Resources

- [Production Readiness Plan](./production-readiness-plan.md)
- [Environment Variables](./environment-variables.md)
- [Database Migrations](./database-migrations.md)
- [API Documentation](./api-documentation.md)
- [Deployment Guide](./production-deployment.md)

