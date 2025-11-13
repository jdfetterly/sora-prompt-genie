import "dotenv/config";
// Initialize Sentry as early as possible
import { initSentry } from "./utils/sentry";
initSentry();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logger } from "./utils/logger";
import { formatErrorResponse } from "./utils/errorFormatter";
import { setupSecurityMiddleware } from "./middleware/security";

/**
 * Validates required environment variables on startup
 * Exits the process with a clear error message if validation fails
 */
function validateEnvironmentVariables(): void {
  const requiredVars: Array<{ name: string; description: string }> = [
    {
      name: "OPENROUTER_API_KEY",
      description: "OpenRouter API key for AI-powered prompt generation",
    },
  ];

  const missingVars: string[] = [];

  for (const { name, description } of requiredVars) {
    if (!process.env[name] || process.env[name]?.trim() === "") {
      missingVars.push(`${name} (${description})`);
    }
  }

  if (missingVars.length > 0) {
    logger.error("Missing required environment variables:", {
      missing: missingVars,
    });
    console.error("\n❌ ERROR: Missing required environment variables:");
    console.error("\nThe following environment variables are required but not set:\n");
    missingVars.forEach((varInfo) => {
      console.error(`  - ${varInfo}`);
    });
    console.error("\nPlease set these variables in your .env file or environment.");
    console.error("See docs/environment-variables.md for documentation.\n");
    process.exit(1);
  }

  // Warn about recommended variables in production
  if (process.env.NODE_ENV === "production") {
    const recommendedVars: Array<{ name: string; description: string }> = [
      {
        name: "SITE_URL",
        description: "Production site URL (used for CORS and API referrer headers)",
      },
      {
        name: "ALLOWED_ORIGINS",
        description: "Comma-separated list of allowed CORS origins",
      },
    ];

    const missingRecommended: string[] = [];
    for (const { name, description } of recommendedVars) {
      if (!process.env[name] || process.env[name]?.trim() === "") {
        missingRecommended.push(`${name} (${description})`);
      }
    }

    if (missingRecommended.length > 0) {
      logger.warn("Missing recommended environment variables for production:", {
        missing: missingRecommended,
      });
      console.warn("\n⚠️  WARNING: The following environment variables are recommended for production:\n");
      missingRecommended.forEach((varInfo) => {
        console.warn(`  - ${varInfo}`);
      });
      console.warn("\nThe application will use default values, which may not be suitable for production.\n");
    }
  }

  logger.info("Environment variable validation passed");
}

// Validate environment variables before starting the server
validateEnvironmentVariables();

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Security middleware (must be before other middleware)
setupSecurityMiddleware(app);

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Only handle errors if response hasn't been sent yet
    if (res.headersSent) {
      return _next(err);
    }
    
    const status = err.status || err.statusCode || 500;
    const errorResponse = formatErrorResponse(err, "Internal Server Error");
    
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5173 if not specified.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5173', 10);
  server.listen(port, "0.0.0.0", () => {
    logger.info(`Server started on port ${port}`);
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  // Handle termination signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions and unhandled rejections
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection:", { reason, promise });
    gracefulShutdown("unhandledRejection");
  });
})();
