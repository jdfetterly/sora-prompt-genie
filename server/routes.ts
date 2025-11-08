import type { Express } from "express";
import { createServer, type Server } from "http";
import { enhancePromptWithAI, generateSuggestions } from "./lib/openrouter";
import { 
  enhancePromptSchema, 
  generateSuggestionsSchema,
  type EnhancePromptResponse,
  type GenerateSuggestionsResponse 
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
    try {
      const request = generateSuggestionsSchema.parse(req.body);
      const suggestions = await generateSuggestions(request.category, request.count);
      
      const response: GenerateSuggestionsResponse = {
        suggestions,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate suggestions" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
