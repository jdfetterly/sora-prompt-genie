import { type EnhancePromptRequest, type Suggestion, type StructurePromptRequest } from "../../shared/schema.js";
import { logger } from "../utils/logger.js";
import { 
  autoAuthorPromptV1, 
  promptEnhancerPromptV1, 
  promptStructuringPromptV1,
  suggestionAgentPromptV1,
} from "../agents/prompts/index.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Model configuration - use cheaper models to reduce costs
// Options: 
//   - google/gemini-2.5-flash-lite (very cheap, current default)
//   - anthropic/claude-3-haiku (cheapest Claude, ~$0.25/$1M input tokens)
//   - google/gemini-flash-1.5 (very cheap, ~$0.075/$1M input tokens)
//   - openai/gpt-3.5-turbo (cheap, ~$0.5/$1M input tokens)
//   - anthropic/claude-3.5-sonnet (expensive, ~$3/$1M input tokens)
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  // Check for API key with more detailed error messages
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === "") {
    const errorMsg = "OPENROUTER_API_KEY environment variable is not set or is empty";
    logger.error("[OpenRouter] API key check failed:", {
      hasKey: !!OPENROUTER_API_KEY,
      keyLength: OPENROUTER_API_KEY?.length || 0,
      keyPrefix: OPENROUTER_API_KEY?.substring(0, 10) || "N/A",
      nodeEnv: process.env.NODE_ENV,
    });
    throw new Error(errorMsg);
  }
  
  // Validate API key format (OpenRouter keys typically start with "sk-or-v1-")
  if (!OPENROUTER_API_KEY.startsWith("sk-or-v1-") && !OPENROUTER_API_KEY.startsWith("sk-or-v1")) {
    logger.warn("[OpenRouter] API key format may be invalid:", {
      keyPrefix: OPENROUTER_API_KEY.substring(0, 10),
    });
  }
  
  // Log API call in development only
  logger.debug("[OpenRouter] Making API call");

  let response: Response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
      } as OpenRouterRequest),
    });
  } catch (error) {
    // Handle network errors (fetch can throw for network issues)
    const errorMsg = error instanceof Error 
      ? error.message 
      : `Network error: ${String(error)}`;
    logger.error("Fetch network error:", { error: errorMsg });
    throw new Error(`Failed to connect to OpenRouter API: ${errorMsg}`);
  }

  if (!response.ok) {
    let errorText = "";
    let errorData: any = null;
    try {
      errorText = await response.text();
      // Try to parse as JSON to extract error details
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // Not JSON, use text as-is
      }
    } catch {
      errorText = response.statusText;
    }
    
    // Provide user-friendly error messages for common issues
    let errorMessage = `OpenRouter API error: ${response.status}`;
    
    if (response.status === 401) {
      if (errorData?.error?.message) {
        errorMessage = `Authentication failed: ${errorData.error.message}. Please check your OPENROUTER_API_KEY environment variable.`;
      } else {
        errorMessage = "Authentication failed: Invalid or missing OpenRouter API key. Please check your OPENROUTER_API_KEY environment variable.";
      }
    } else if (response.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else if (errorData?.error?.message) {
      errorMessage = `OpenRouter API error: ${errorData.error.message}`;
    } else if (errorText) {
      errorMessage = `OpenRouter API error: ${response.status} ${errorText}`;
    }
    
    logger.error("OpenRouter API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      parsedError: errorData,
      url: OPENROUTER_API_URL,
      model: OPENROUTER_MODEL,
    });
    throw new Error(errorMessage);
  }

  let data: OpenRouterResponse;
  try {
    data = await response.json() as OpenRouterResponse;
  } catch (error) {
    const text = await response.text();
    logger.error("Failed to parse OpenRouter response as JSON:", {
      error,
      rawResponse: text.substring(0, 500), // Log first 500 chars
    });
    throw new Error(`Invalid JSON response from OpenRouter API: ${text.substring(0, 200)}`);
  }

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    logger.error("Invalid OpenRouter response structure:", {
      response: data,
    });
    throw new Error("OpenRouter API returned invalid response structure");
  }

  const content = data.choices[0].message.content;
  if (!content) {
    logger.error("OpenRouter response missing content:", {
      response: data,
    });
    throw new Error("OpenRouter API response missing message content");
  }

  return content;
}

export async function enhancePromptWithAI(request: EnhancePromptRequest): Promise<string> {
  const systemPrompt = promptEnhancerPromptV1.systemPrompt;

  const userPrompt = request.currentPrompt
    ? `Current prompt: "${request.currentPrompt}"

Enhancement to integrate:
Category: ${request.enhancement.category}
Title: ${request.enhancement.title}
Description: ${request.enhancement.description}

Please merge this enhancement into the current prompt, adjusting the text as needed for natural flow while preserving the original scene's essence. Return ONLY the enhanced prompt text, nothing else.`
    : `Create a video prompt incorporating this cinematic element:
Category: ${request.enhancement.category}
Title: ${request.enhancement.title}
Description: ${request.enhancement.description}

Return ONLY the prompt text, nothing else.`;

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callOpenRouter(messages);
}

export async function autoGeneratePrompt(basicPrompt: string): Promise<string> {
  const systemPrompt = autoAuthorPromptV1.systemPrompt;

  const userPrompt = `Expand this basic video idea into a detailed, cinematic Sora prompt:

"${basicPrompt}"

Return ONLY the enhanced prompt text, nothing else.`;

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callOpenRouter(messages);
}

export async function structurePromptWithAI(request: StructurePromptRequest): Promise<string> {
  const systemPrompt = promptStructuringPromptV1.systemPrompt;

  const userPrompt = request.currentPrompt
    ? `Restructure this video prompt according to the Sora prompt guide template format:

"${request.currentPrompt}"

Return ONLY the structured prompt text, nothing else.`
    : `The prompt is empty. Return an empty string.`;

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const result = await callOpenRouter(messages);
  
  // Return empty string if prompt was empty
  if (!request.currentPrompt.trim()) {
    return "";
  }
  
  return result;
}

export async function generateSuggestionsWithOpenRouter(category: string, count: number, currentPrompt?: string): Promise<Suggestion[]> {
  logger.debug("generateSuggestions called", { category, count });
  
  const systemPrompt = `${suggestionAgentPromptV1.systemPrompt}

IMPORTANT: Return ONLY a valid JSON array with no markdown formatting, no code blocks, no explanations. The response must be parseable JSON.

Return suggestions as a JSON array with this exact structure:
[
  {
    "title": "Brief, catchy title (3-5 words)",
    "description": "Clear, specific description of the cinematic element (one concise sentence)"
  }
]`;

  const categoryDescriptions: Record<string, string> = {
    "camera-angles": "camera angles and framing perspectives",
    "camera-motion": "camera movement and motion techniques",
    "lighting": "lighting setups and atmospheric lighting effects",
    "style": "visual styles, film aesthetics, and artistic approaches",
    "depth-of-field": "focus techniques and depth of field effects",
    "motion-timing": "timing, pacing, and motion choreography",
    "color-palette": "color schemes and palette choices",
    "weather": "weather conditions and atmospheric effects",
    "time-of-day": "time of day lighting and atmospheric conditions",
    "mood": "emotional atmosphere and mood settings",
    "composition": "compositional techniques and framing rules",
    "texture": "texture and surface qualities",
  };

  const categoryDesc = categoryDescriptions[category] || "cinematic enhancements";

  let userPrompt: string;
  
  if (currentPrompt && currentPrompt.trim()) {
    userPrompt = `Current video prompt: "${currentPrompt}"

Generate ${count} creative and contextually relevant suggestions for ${categoryDesc} that would enhance this specific scene. Consider what's already described and suggest complementary options that would elevate the visual storytelling. Make each suggestion unique and professionally described. Return as a JSON array only.`;
  } else {
    userPrompt = `Generate ${count} creative and diverse suggestions for ${categoryDesc}. Make each one unique and professionally described, covering a wide range of creative approaches. Return as a JSON array only.`;
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let response: string;
  try {
    response = await callOpenRouter(messages);
    logger.debug("OpenRouter API call successful");
  } catch (error) {
    logger.error("Error in callOpenRouter:", { error });
    throw error;
  }
  
  try {
    // Try to extract JSON from the response (AI might wrap it in markdown code blocks)
    let jsonString = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonString.startsWith("```")) {
      const lines = jsonString.split("\n");
      // Remove first line (```json or ```)
      lines.shift();
      // Remove last line (```)
      if (lines[lines.length - 1].trim() === "```") {
        lines.pop();
      }
      jsonString = lines.join("\n");
    }
    
    const suggestions = JSON.parse(jsonString);
    
    // Validate the response structure
    if (!Array.isArray(suggestions)) {
      throw new Error("AI response is not an array");
    }
    
    // Validate each suggestion has required fields
    const validSuggestions = suggestions.filter((s: any) => {
      return s && typeof s.title === "string" && typeof s.description === "string";
    });
    
    if (validSuggestions.length === 0) {
      throw new Error("No valid suggestions found in AI response");
    }
    
    return validSuggestions.map((s: any, index: number) => ({
      id: `ai-${category}-${Date.now()}-${index}`,
      title: s.title.trim(),
      description: s.description.trim(),
      category,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    logger.error("Failed to parse AI suggestions:", {
      error: errorMessage,
      responsePreview: response.substring(0, 500),
    });
    throw new Error(`Failed to parse AI suggestions: ${errorMessage}. Response preview: ${response.substring(0, 500)}`);
  }
}

export { generateSuggestionsWithOpenRouter as generateSuggestions };
