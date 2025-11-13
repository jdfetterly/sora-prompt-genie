import { logger } from "./logger";
// Import Sentry captureException with error handling
// Use a lazy import pattern to handle cases where Sentry module might not be available
let captureExceptionFn: ((error: Error, context?: Record<string, any>) => void) | null = null;
let sentryImportPromise: Promise<void> | null = null;

async function getCaptureException(): Promise<((error: Error, context?: Record<string, any>) => void) | null> {
  if (captureExceptionFn !== null) {
    return captureExceptionFn;
  }
  
  // If we're already trying to import, wait for that
  if (sentryImportPromise) {
    await sentryImportPromise;
    return captureExceptionFn;
  }
  
  // Try to import Sentry dynamically
  sentryImportPromise = import("./sentry")
    .then((sentryModule) => {
      if (sentryModule.captureException) {
        captureExceptionFn = sentryModule.captureException;
      }
    })
    .catch(() => {
      // Sentry not available - that's okay, we'll just not use it
      captureExceptionFn = null;
    });
  
  await sentryImportPromise;
  return captureExceptionFn;
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Sanitizes error information for client responses.
 * In production, removes stack traces and internal details.
 * In development, includes more information for debugging.
 */
export function sanitizeError(error: unknown): {
  error: string;
  details?: string;
} {
  // Log the full error details server-side
  if (error instanceof Error) {
    logger.error("Error occurred:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Capture in Sentry for production monitoring (if available)
    // Don't await - let it happen in background to avoid blocking
    getCaptureException().then((captureFn) => {
      if (captureFn) {
        captureFn(error);
      }
    }).catch(() => {
      // Ignore errors during Sentry capture
    });
  } else {
    logger.error("Unknown error occurred:", { error });
    // Capture unknown errors as messages (if Sentry is available)
    // Don't await - let it happen in background
    getCaptureException().then((captureFn) => {
      if (captureFn) {
        captureFn(new Error(String(error)));
      }
    }).catch(() => {
      // Ignore errors during Sentry capture
    });
  }

  // Return sanitized error for client
  if (error instanceof Error) {
    // In development, include more details
    if (isDevelopment) {
      return {
        error: error.message,
        details: error.stack,
      };
    }

    // In production, return only safe error messages
    // Check for common error types and provide user-friendly messages
    if (error.message.includes("OPENROUTER_API_KEY") || error.message.includes("environment variable")) {
      return {
        error: "Server configuration error",
        details: "The API key is not properly configured. Please check your Vercel environment variables.",
      };
    }

    if (error.message.includes("Network") || error.message.includes("fetch")) {
      return {
        error: "Network error. Please try again.",
      };
    }

    if (error.message.includes("Rate limit")) {
      return {
        error: "Rate limit exceeded. Please try again in a moment.",
      };
    }

    if (error.message.includes("Authentication")) {
      return {
        error: "Authentication failed. Please contact support.",
      };
    }

    // Generic error message for production
    return {
      error: "An error occurred. Please try again.",
    };
  }

  // Unknown error type
  if (isDevelopment) {
    return {
      error: String(error),
    };
  }

  return {
    error: "An unexpected error occurred. Please try again.",
  };
}

/**
 * Formats error response for API endpoints
 */
export function formatErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): { error: string; details?: string } {
  return sanitizeError(error);
}

