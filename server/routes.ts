import type { Express } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { writeFileSync } from "fs";
import { enhancePromptWithAI, generateSuggestions, autoGeneratePrompt } from "./lib/openrouter";
import { 
  enhancePromptSchema, 
  generateSuggestionsSchema,
  autoGeneratePromptSchema,
  type EnhancePromptResponse,
  type GenerateSuggestionsResponse,
  type AutoGeneratePromptResponse 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const request = enhancePromptSchema.parse(req.body);
      const enhancedPrompt = await enhancePromptWithAI(request);
      
      const response: EnhancePromptResponse = {
        enhancedPrompt,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to enhance prompt" 
      });
    }
  });

  app.post("/api/generate-suggestions", async (req, res) => {
    // Write to file immediately to verify this route is being called
    try {
      writeFileSync('/tmp/sora-route-called.log', JSON.stringify({
        timestamp: new Date().toISOString(),
        body: req.body,
      }, null, 2));
    } catch (e) {}
    
    console.log("=== /api/generate-suggestions called ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const request = generateSuggestionsSchema.parse(req.body);
      console.log("Parsed request:", request);
      
      const suggestions = await generateSuggestions(
        request.category, 
        request.count,
        request.currentPrompt
      );
      
      console.log("Successfully generated", suggestions.length, "suggestions");
      
      const response: GenerateSuggestionsResponse = {
        suggestions,
      };
      
      res.json(response);
    } catch (error) {
      console.error("=== ERROR in /api/generate-suggestions ===");
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error instance of Error?", error instanceof Error);
      
      // Log to stderr which should be visible
      process.stderr.write(`\n=== ERROR DETAILS ===\n`);
      process.stderr.write(`Type: ${typeof error}\n`);
      process.stderr.write(`Constructor: ${error?.constructor?.name}\n`);
      process.stderr.write(`Is Error: ${error instanceof Error}\n`);
      
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        process.stderr.write(`Name: ${error.name}\n`);
        process.stderr.write(`Message: ${error.message}\n`);
        process.stderr.write(`Stack: ${error.stack}\n`);
      } else {
        console.error("Error value:", error);
        console.error("Stringified error:", JSON.stringify(error, null, 2));
        process.stderr.write(`Value: ${JSON.stringify(error)}\n`);
      }
      process.stderr.write(`===================\n\n`);
      
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error.errors);
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      // All other errors return 500 with detailed message
      // Force extract error message - handle all cases
      let errorMessage = "Failed to generate suggestions";
      let errorDetails: any = {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        isErrorInstance: error instanceof Error,
      };
      
      if (error instanceof Error) {
        errorMessage = error.message || error.name || String(error) || errorMessage;
        errorDetails = {
          ...errorDetails,
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 10),
          toString: error.toString(),
        };
      } else if (error !== null && error !== undefined) {
        errorMessage = String(error);
        errorDetails = { 
          ...errorDetails,
          raw: error,
          stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        };
      }
      
      // Always include details in the response for debugging - FORCE it
      console.error("Returning error to client:", errorMessage);
      console.error("Full error details:", JSON.stringify(errorDetails, null, 2));
      
      // Write error to file for debugging
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          errorMessage,
          errorDetails,
          fullError: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : String(error),
        };
        writeFileSync('/tmp/sora-error.log', JSON.stringify(errorLog, null, 2));
      } catch (e) {
        console.error("Failed to write error log:", e);
      }
      
      // Ensure response is sent with all details
      res.status(500).json({ 
        error: errorMessage,
        details: errorDetails,
        _debug: {
          hasMessage: !!(error instanceof Error && error.message),
          errorString: String(error),
        }
      });
    }
  });

  app.post("/api/auto-generate-prompt", async (req, res) => {
    try {
      const request = autoGeneratePromptSchema.parse(req.body);
      const generatedPrompt = await autoGeneratePrompt(request.basicPrompt);
      
      const response: AutoGeneratePromptResponse = {
        generatedPrompt,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error auto-generating prompt:", error);
      
      // Handle Zod validation errors with 400 status
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: error.errors[0]?.message || "Validation failed" 
        });
        return;
      }
      
      // All other errors return 500
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to auto-generate prompt" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
