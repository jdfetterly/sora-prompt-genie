import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import { logger } from "../server/utils/logger";
import { formatErrorResponse } from "../server/utils/errorFormatter";
import { setupSecurityMiddleware } from "../server/middleware/security";

// Initialize Sentry as early as possible
// Use dynamic import with error handling for Vercel compatibility
// This prevents the function from crashing if the module can't be resolved
let sentryInitialized = false;
try {
  // Use dynamic import to handle potential module resolution issues
  const initSentryPromise = import("../server/utils/sentry").then((sentryModule) => {
    if (sentryModule.initSentry) {
      sentryModule.initSentry();
      sentryInitialized = true;
    }
  });
  // Don't await - let it initialize in the background
  initSentryPromise.catch((error) => {
    // Only log if it's not a module resolution error
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (!errorMsg.includes("Cannot find module") && !errorMsg.includes("ERR_MODULE_NOT_FOUND")) {
      console.warn("Sentry initialization warning:", errorMsg);
    }
  });
} catch (error) {
  // Handle synchronous import errors
  const errorMsg = error instanceof Error ? error.message : String(error);
  if (!errorMsg.includes("Cannot find module") && !errorMsg.includes("ERR_MODULE_NOT_FOUND")) {
    console.warn("Sentry import warning:", errorMsg);
  }
}

/**
 * Validates required environment variables
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
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  logger.info("Environment variable validation passed");
}

// Validate environment variables
// In Vercel, we validate but don't exit - let the request handler show a proper error
let envValidationError: Error | null = null;
try {
  validateEnvironmentVariables();
} catch (error) {
  logger.error("Environment validation failed:", error);
  envValidationError = error as Error;
}

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      logger.info(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Initialize routes and static serving
let appInitialized = false;

async function initializeApp() {
  if (appInitialized) return;
  
  // Register routes (returns Server but we don't need it for Vercel)
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Only handle errors if response hasn't been sent yet
    if (res.headersSent) {
      return _next(err);
    }
    
    const status = err.status || err.statusCode || 500;
    const errorResponse = formatErrorResponse(err, "Internal Server Error");
    
    res.status(status).json(errorResponse);
  });

  // Serve static files in production
  serveStatic(app);
  
  appInitialized = true;
}

// Initialize app on first request
app.use(async (req, res, next) => {
  // Check for environment validation errors first
  if (envValidationError) {
    logger.error("Request blocked due to missing environment variables");
    return res.status(500).json({
      error: "Server configuration error",
      message: envValidationError.message,
      details: "Missing required environment variables. Please check Vercel project settings."
    });
  }

  if (!appInitialized) {
    try {
      await initializeApp();
    } catch (error) {
      logger.error("Failed to initialize app:", error);
      return res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  next();
});

// Export the app for Vercel
export default app;

