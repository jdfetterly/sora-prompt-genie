import { z } from "zod";

/**
 * Shared agent schema definitions so both server and client can rely on the same contracts.
 * These schemas intentionally allow optional metadata so we can evolve responses without breaking consumers.
 */

export const promptEnhancerAgentInputSchema = z.object({
  currentPrompt: z.string().default(""),
  enhancement: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    source: z.enum(["preset", "manual", "suggestion"]).optional(),
  }),
  promptBeforeCategory: z.string().optional(),
  mode: z.enum(["simple", "advanced"]).optional(),
  historyLength: z.number().int().nonnegative().optional(),
  userPreferences: z.record(z.any()).optional(),
});

export type PromptEnhancerAgentInput = z.infer<typeof promptEnhancerAgentInputSchema>;

export const promptEnhancerAgentOutputSchema = z.object({
  prompt: z.string(),
  rationale: z.string().optional(),
  diff: z.object({
    before: z.string(),
    after: z.string(),
    highlights: z.array(z.string()).optional(),
  }).optional(),
});

export type PromptEnhancerAgentOutput = z.infer<typeof promptEnhancerAgentOutputSchema>;

export const suggestionAgentInputSchema = z.object({
  category: z.string(),
  count: z.number().int().min(1).max(20).default(8),
  currentPrompt: z.string().optional(),
  appliedCategories: z.array(z.string()).optional(),
  mode: z.enum(["simple", "advanced"]).optional(),
  focusTags: z.array(z.string()).optional(),
  flowId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SuggestionAgentInput = z.infer<typeof suggestionAgentInputSchema>;

export const suggestionAgentOutputSchema = z.object({
  suggestions: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    rationale: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })),
  metadata: z.object({
    provider: z.string().optional(),
    latencyMs: z.number().optional(),
    warnings: z.array(z.string()).optional(),
  }).optional(),
});

export type SuggestionAgentOutput = z.infer<typeof suggestionAgentOutputSchema>;

export const autoAuthorAgentInputSchema = z.object({
  basicPrompt: z.string(),
  persona: z.string().optional(),
  constraints: z.object({
    duration: z.string().optional(),
    aspectRatio: z.string().optional(),
    styleGuidance: z.string().optional(),
  }).optional(),
});

export type AutoAuthorAgentInput = z.infer<typeof autoAuthorAgentInputSchema>;

export const autoAuthorAgentOutputSchema = z.object({
  prompt: z.string(),
  rationale: z.string().optional(),
  suggestedEnhancements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
  })).optional(),
});

export type AutoAuthorAgentOutput = z.infer<typeof autoAuthorAgentOutputSchema>;

export const promptStructuringAgentInputSchema = z.object({
  currentPrompt: z.string(),
  templateVersion: z.string().default("1.0"),
  includeDialogue: z.boolean().optional(),
});

export type PromptStructuringAgentInput = z.infer<typeof promptStructuringAgentInputSchema>;

export const promptStructuringAgentOutputSchema = z.object({
  scene: z.string(),
  cinematography: z.object({
    cameraShot: z.string(),
    mood: z.string(),
  }),
  actions: z.array(z.string()).optional(),
  dialogue: z.array(z.string()).optional(),
  formatted: z.string(),
});

export type PromptStructuringAgentOutput = z.infer<typeof promptStructuringAgentOutputSchema>;
