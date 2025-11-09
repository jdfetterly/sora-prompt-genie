import { type EnhancePromptRequest, type Suggestion, type StructurePromptRequest } from "@shared/schema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Model configuration - use cheaper models to reduce costs
// Options: 
//   - anthropic/claude-3-haiku (cheapest Claude, ~$0.25/$1M input tokens)
//   - google/gemini-flash-1.5 (very cheap, ~$0.075/$1M input tokens)
//   - openai/gpt-3.5-turbo (cheap, ~$0.5/$1M input tokens)
//   - anthropic/claude-3.5-sonnet (expensive, ~$3/$1M input tokens - current default)
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3-haiku";

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
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  
  // Debug logging (key prefix only, not full key)
  const keyPrefix = OPENROUTER_API_KEY.substring(0, Math.min(10, OPENROUTER_API_KEY.length));
  console.log(`[OpenRouter] Making API call with key prefix: ${keyPrefix}... (length: ${OPENROUTER_API_KEY.length})`);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:5000",
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
    console.error("Fetch network error:", errorMsg);
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
    
    console.error("OpenRouter API Error Details:", {
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
    console.error("Failed to parse OpenRouter response as JSON:", error);
    const text = await response.text();
    console.error("Raw response:", text);
    throw new Error(`Invalid JSON response from OpenRouter API: ${text.substring(0, 200)}`);
  }

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    console.error("Invalid OpenRouter response structure:", JSON.stringify(data, null, 2));
    throw new Error("OpenRouter API returned invalid response structure");
  }

  const content = data.choices[0].message.content;
  if (!content) {
    console.error("OpenRouter response missing content:", JSON.stringify(data, null, 2));
    throw new Error("OpenRouter API response missing message content");
  }

  return content;
}

export async function enhancePromptWithAI(request: EnhancePromptRequest): Promise<string> {
  const systemPrompt = `You are an expert video prompt engineer specializing in Sora AI video generation. Your task is to seamlessly integrate new cinematic elements into existing video prompts while:

1. Preserving the core intent and subject matter of the original prompt
2. Ensuring natural readability and flow
3. Integrating the new element cohesively without redundancy
4. Maintaining professional cinematography language
5. Keeping the prompt concise yet descriptive

When the current prompt is empty, create a complete prompt based on the enhancement description.
When merging, blend the enhancement naturally into the existing prompt rather than simply appending it.`;

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
  const systemPrompt = `You are an expert video prompt engineer specializing in Sora AI video generation. Your task is to expand basic video ideas into detailed, cinematic prompts that include:

1. Rich visual descriptions
2. Camera angles and movement
3. Lighting and atmosphere
4. Color palette suggestions
5. Mood and emotion
6. Specific details that bring the scene to life

Keep prompts concise yet evocative (2-4 sentences). Use professional cinematography language while maintaining readability.`;

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
  const systemPrompt = `You are an expert video prompt engineer specializing in Sora AI video generation. Your task is to restructure video prompts according to the Sora prompt guide template format.

The structured format should include:
1. A prose scene description in plain language (describe characters, costumes, scenery, weather, and other details)
2. A Cinematography section with:
   - Camera shot: [framing and angle, e.g. wide establishing shot, eye level]
   - Mood: [overall tone, e.g. cinematic and tense, playful and suspenseful, luxurious anticipation]
3. An Actions section with bulleted list of specific beats or gestures
4. A Dialogue section (only if the shot has dialogue)

Preserve ALL content from the original prompt. Organize it intelligently into these sections. If the prompt already follows this structure, maintain it but ensure it's properly formatted. If certain sections don't apply (e.g., no dialogue), omit them.`;

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

export async function generateSuggestions(category: string, count: number, currentPrompt?: string): Promise<Suggestion[]> {
  console.log("=== generateSuggestions START ===");
  console.log("generateSuggestions called with:", { category, count, currentPrompt: currentPrompt?.substring(0, 50) });
  console.log("OPENROUTER_API_KEY exists:", !!OPENROUTER_API_KEY);
  console.log("OPENROUTER_API_KEY length:", OPENROUTER_API_KEY?.length || 0);
  console.log("OPENROUTER_MODEL:", OPENROUTER_MODEL);
  
  const systemPrompt = `You are a creative cinematography consultant specializing in Sora AI video generation. Generate diverse, professional enhancement suggestions for video prompts.

Each suggestion should be:
- Contextually relevant to the user's current creative direction
- Specific and actionable
- Varied in style and approach
- Professionally described
- Complementary to what's already described in the prompt

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

  console.log("Calling OpenRouter API...");
  let response: string;
  try {
    response = await callOpenRouter(messages);
    console.log("OpenRouter API call successful, response length:", response.length);
  } catch (error) {
    console.error("Error in callOpenRouter:", error);
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
    console.error("Failed to parse AI suggestions:", error);
    console.error("AI response was:", response);
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    const fullError = `Failed to parse AI suggestions: ${errorMessage}. Response preview: ${response.substring(0, 500)}`;
    console.error(fullError);
    throw new Error(fullError);
  }
}
