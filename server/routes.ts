import type { Express } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { enhancePromptWithAI, autoGeneratePrompt, structurePromptWithAI } from "./lib/openrouter.js";
import { generateSuggestionsAgent } from "./agents/suggestionAgent.js";
import { 
  generalLimiter, 
  enhancePromptLimiter,
  generateSuggestionsLimiter,
  autoGeneratePromptLimiter,
  structurePromptLimiter
} from "./middleware/rateLimit.js";
import { logger } from "./utils/logger.js";
import { formatErrorResponse } from "./utils/errorFormatter.js";
import { 
  enhancePromptSchema, 
  generateSuggestionsSchema,
  autoGeneratePromptSchema,
  structurePromptSchema,
  type EnhancePromptResponse,
  type GenerateSuggestionsResponse,
  type AutoGeneratePromptResponse,
  type StructurePromptResponse 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (excluded from rate limiting for monitoring)
  app.get("/api/health", (_req, res) => {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== "";
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      // Include API key status without exposing the actual key
      apiKeyConfigured: hasApiKey,
      apiKeyPrefix: hasApiKey ? process.env.OPENROUTER_API_KEY?.substring(0, 10) + "..." : null,
    });
  });

  // Apply general rate limiting to all API routes
  app.use("/api", generalLimiter);

  // AI-powered endpoints use per-endpoint rate limiting (24-hour windows)
  app.post("/api/enhance-prompt", enhancePromptLimiter, async (req, res) => {
    try {
      // Pre-flight check for API key before processing
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
        logger.error("Enhance-prompt called but OPENROUTER_API_KEY is missing");
        return res.status(500).json({
          error: "Server configuration error",
          details: "OPENROUTER_API_KEY environment variable is not configured. Please check your Vercel project settings.",
        });
      }

      const request = enhancePromptSchema.parse(req.body);
      const enhancedPrompt = await enhancePromptWithAI(request);
      
      const response: EnhancePromptResponse = {
        enhancedPrompt,
      };
      
      res.json(response);
    } catch (error) {
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        logger.warn("Validation error in enhance-prompt:", {
          errors: error.errors,
        });
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      // Log the full error for debugging
      logger.error("Error in enhance-prompt endpoint:", {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
      });
      
      const errorResponse = formatErrorResponse(error, "Failed to enhance prompt");
      res.status(500).json(errorResponse);
    }
  });

  app.post("/api/generate-suggestions", generateSuggestionsLimiter, async (req, res) => {
    try {
      const request = generateSuggestionsSchema.parse(req.body);
      const suggestions = await generateSuggestionsAgent({
        category: request.category,
        count: request.count,
        currentPrompt: request.currentPrompt,
      });
      
      const response: GenerateSuggestionsResponse = {
        suggestions,
      };
      
      res.json(response);
    } catch (error) {
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        logger.warn("Validation error in generate-suggestions:", {
          errors: error.errors,
        });
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      const errorResponse = formatErrorResponse(error, "Failed to generate suggestions");
      res.status(500).json(errorResponse);
    }
  });

  app.post("/api/auto-generate-prompt", autoGeneratePromptLimiter, async (req, res) => {
    try {
      const request = autoGeneratePromptSchema.parse(req.body);
      const generatedPrompt = await autoGeneratePrompt(request.basicPrompt);
      
      const response: AutoGeneratePromptResponse = {
        generatedPrompt,
      };
      
      res.json(response);
    } catch (error) {
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        logger.warn("Validation error in auto-generate-prompt:", {
          errors: error.errors,
        });
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      const errorResponse = formatErrorResponse(error, "Failed to auto-generate prompt");
      res.status(500).json(errorResponse);
    }
  });

  app.post("/api/structure-prompt", structurePromptLimiter, async (req, res) => {
    try {
      const request = structurePromptSchema.parse(req.body);
      const structuredPrompt = await structurePromptWithAI(request);
      
      const response: StructurePromptResponse = {
        structuredPrompt,
      };
      
      res.json(response);
    } catch (error) {
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        logger.warn("Validation error in structure-prompt:", {
          errors: error.errors,
        });
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      const errorResponse = formatErrorResponse(error, "Failed to structure prompt");
      res.status(500).json(errorResponse);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
