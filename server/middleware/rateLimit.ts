import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for /api/enhance-prompt
 * Limits: 20 requests per 24 hours per IP
 */
export const enhancePromptLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // Limit each IP to 20 requests per 24 hours
  message: "Rate limit exceeded for enhance-prompt. You have reached your daily limit of 20 requests. Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

/**
 * Rate limiter for /api/generate-suggestions
 * Limits: 10 requests per 24 hours per IP
 */
export const generateSuggestionsLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 requests per 24 hours
  message: "Rate limit exceeded for generate-suggestions. You have reached your daily limit of 10 requests. Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for /api/auto-generate-prompt
 * Limits: 10 requests per 24 hours per IP
 */
export const autoGeneratePromptLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 requests per 24 hours
  message: "Rate limit exceeded for auto-generate-prompt. You have reached your daily limit of 10 requests. Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for /api/structure-prompt
 * Limits: 10 requests per 24 hours per IP
 */
export const structurePromptLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 requests per 24 hours
  message: "Rate limit exceeded for structure-prompt. You have reached your daily limit of 10 requests. Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

