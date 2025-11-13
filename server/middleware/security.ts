import helmet from "helmet";
import cors from "cors";
import type { Express } from "express";

/**
 * Configure security middleware for the Express app
 * - Helmet: Sets various HTTP headers for security
 * - CORS: Configures Cross-Origin Resource Sharing
 */
export function setupSecurityMiddleware(app: Express): void {
  // Helmet security headers
  // Disable strict CSP in development for Vite HMR, enable in production
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://openrouter.ai"],
        },
      } : false, // Disable in development for Vite HMR
    })
  );

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
    : process.env.NODE_ENV === "production"
    ? [process.env.SITE_URL || "https://sorapromptgenie.com"]
    : ["http://localhost:5000", "http://localhost:5173"]; // Default dev origins

  app.use(
    cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
}

