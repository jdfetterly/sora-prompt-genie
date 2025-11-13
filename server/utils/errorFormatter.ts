import { logger } from "./logger";
import { captureException } from "./sentry";

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
    // Capture in Sentry for production monitoring
    captureException(error);
  } else {
    logger.error("Unknown error occurred:", { error });
    // Capture unknown errors as messages
    captureException(new Error(String(error)));
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
    if (error.message.includes("OPENROUTER_API_KEY")) {
      return {
        error: "API configuration error. Please contact support.",
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

