import { z } from "zod";

export const enhancePromptSchema = z.object({
  currentPrompt: z.string(),
  enhancement: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
  }),
});

export type EnhancePromptRequest = z.infer<typeof enhancePromptSchema>;

export const enhancePromptResponseSchema = z.object({
  enhancedPrompt: z.string(),
});

export type EnhancePromptResponse = z.infer<typeof enhancePromptResponseSchema>;

export const generateSuggestionsSchema = z.object({
  category: z.string(),
  count: z.number().min(1).max(20).default(8),
  currentPrompt: z.string().optional(),
});

export type GenerateSuggestionsRequest = z.infer<typeof generateSuggestionsSchema>;

export const suggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
});

export const generateSuggestionsResponseSchema = z.object({
  suggestions: z.array(suggestionSchema),
});

export type GenerateSuggestionsResponse = z.infer<typeof generateSuggestionsResponseSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;

export const autoGeneratePromptSchema = z.object({
  basicPrompt: z.string().min(1).refine(
    (val) => val.trim().split(/\s+/).filter(word => word.length > 0).length >= 3,
    { message: "Basic prompt must contain at least 3 words" }
  ),
});

export type AutoGeneratePromptRequest = z.infer<typeof autoGeneratePromptSchema>;

export const autoGeneratePromptResponseSchema = z.object({
  generatedPrompt: z.string(),
});

export type AutoGeneratePromptResponse = z.infer<typeof autoGeneratePromptResponseSchema>;
