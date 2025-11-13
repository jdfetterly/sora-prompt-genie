import * as Sentry from "@sentry/node";
import { logger } from "./logger";

let sentryInitialized = false;

/**
 * Initialize Sentry for error tracking
 * Only initializes if SENTRY_DSN is provided
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    logger.info("Sentry DSN not provided, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0, // 10% in production, 100% in dev
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }
      }
      return event;
    },
  });

  sentryInitialized = true;
  logger.info("Sentry initialized for error tracking");
}

/**
 * Capture an exception with Sentry
 * No-op if Sentry is not initialized
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!sentryInitialized) {
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message with Sentry
 * No-op if Sentry is not initialized
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "error"): void {
  if (!sentryInitialized) {
    return;
  }
  Sentry.captureMessage(message, level);
}

