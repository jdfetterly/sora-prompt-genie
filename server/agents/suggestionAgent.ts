import { performance } from "node:perf_hooks";
import { z } from "zod";
import { suggestionAgentInputSchema, suggestionAgentOutputSchema, type SuggestionAgentInput } from "../../shared/agents/index.js";
import type { Suggestion } from "../../shared/schema.js";
import { LangflowClient } from "../services/llm/langflowClient.js";
import { generateSuggestionsWithOpenRouter } from "../lib/openrouter.js";

const langflowClient = new LangflowClient({
  baseUrl: process.env.LANGFLOW_BASE_URL,
  apiKey: process.env.LANGFLOW_API_KEY,
  defaultFlowId: process.env.LANGFLOW_SUGGESTION_FLOW_ID,
});

const fallbackReasonSchema = z.object({
  step: z.string(),
  error: z.string(),
});

export async function generateSuggestionsAgent(input: SuggestionAgentInput): Promise<Suggestion[]> {
  const parsedInput = suggestionAgentInputSchema.parse(input);

  if (!langflowClient.isConfigured()) {
    return await generateSuggestionsWithOpenRouter(parsedInput.category, parsedInput.count, parsedInput.currentPrompt);
  }

  const startTime = performance.now();
  try {
    const flowResponse = await langflowClient.runJsonFlow({
      flowId: parsedInput.flowId,
      input: {
        category: parsedInput.category,
        count: parsedInput.count,
        current_prompt: parsedInput.currentPrompt ?? "",
        applied_categories: parsedInput.appliedCategories ?? [],
        focus_tags: parsedInput.focusTags ?? [],
        mode: parsedInput.mode ?? "advanced",
        metadata: parsedInput.metadata ?? {},
      },
      inputType: "structured",
      outputType: "json",
    });

    const parsedOutput = suggestionAgentOutputSchema.parse(flowResponse);
    const latencyMs = Math.round(performance.now() - startTime);

    console.log("[SuggestionAgent] Langflow response metadata:", {
      provider: parsedOutput.metadata?.provider ?? "langflow",
      latencyMs,
      warnings: parsedOutput.metadata?.warnings,
    });

    if (!parsedOutput.suggestions.length) {
      throw new Error("Langflow suggestion agent returned no suggestions");
    }

    return parsedOutput.suggestions.map((suggestion, index) => ({
      id: suggestion.id ?? `agent-${parsedInput.category}-${Date.now()}-${index}`,
      title: suggestion.title.trim(),
      description: suggestion.description.trim(),
      category: suggestion.category ?? parsedInput.category,
    }));
  } catch (error) {
    const fallbackReason = fallbackReasonSchema.safeParse({
      step: "[SuggestionAgent] Langflow invocation failed",
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(fallbackReason.success ? fallbackReason.data.step : "[SuggestionAgent] Unknown error", error);
    console.warn("[SuggestionAgent] Falling back to OpenRouter suggestions");
    return await generateSuggestionsWithOpenRouter(parsedInput.category, parsedInput.count, parsedInput.currentPrompt);
  }
}
