/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 process manager for production deployment.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js          # Start the application
 *   pm2 stop ecosystem.config.js          # Stop the application
 *   pm2 restart ecosystem.config.js       # Restart the application
 *   pm2 logs ecosystem.config.js          # View logs
 *   pm2 monit                             # Monitor processes
 *   pm2 delete ecosystem.config.js        # Remove from PM2
 * 
 * Environment variables should be set in your deployment environment
 * or via a .env file (not committed to version control).
 */

module.exports = {
  apps: [
    {
      name: "sora-prompt-genie",
      script: "./dist/index.js",
      instances: 1, // Set to "max" for cluster mode (requires stateless app)
      exec_mode: "fork", // Use "cluster" for load balancing across CPU cores
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Logging configuration
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true, // Prepend timestamp to logs
      merge_logs: true, // Merge logs from all instances
      
      // Process management
      autorestart: true, // Auto-restart if app crashes
      watch: false, // Don't watch files in production
      max_memory_restart: "500M", // Restart if memory exceeds 500MB
      
      // Graceful shutdown
      kill_timeout: 10000, // Wait 10 seconds for graceful shutdown
      wait_ready: false, // Don't wait for ready signal (we don't emit it)
      
      // Advanced options
      min_uptime: "10s", // Consider app stable after 10 seconds
      max_restarts: 10, // Max restarts in 1 minute window
      restart_delay: 4000, // Wait 4 seconds before restarting
    },
  ],
};

