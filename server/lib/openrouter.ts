import { type EnhancePromptRequest, type Suggestion } from "@shared/schema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:5000",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages,
      temperature: 0.7,
    } as OpenRouterRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as OpenRouterResponse;
  return data.choices[0].message.content;
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

export async function generateSuggestions(category: string, count: number, currentPrompt?: string): Promise<Suggestion[]> {
  const systemPrompt = `You are a creative cinematography consultant specializing in Sora AI video generation. Generate diverse, professional enhancement suggestions for video prompts.

Each suggestion should be:
- Contextually relevant to the user's current creative direction
- Specific and actionable
- Varied in style and approach
- Professionally described
- Complementary to what's already described in the prompt

Return suggestions as a JSON array with this structure:
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

  const response = await callOpenRouter(messages);
  
  try {
    const suggestions = JSON.parse(response);
    return suggestions.map((s: any, index: number) => ({
      id: `ai-${category}-${Date.now()}-${index}`,
      title: s.title,
      description: s.description,
      category,
    }));
  } catch (error) {
    console.error("Failed to parse AI suggestions:", error);
    throw new Error("Failed to generate suggestions");
  }
}
