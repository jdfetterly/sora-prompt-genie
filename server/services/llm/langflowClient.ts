export interface LangflowClientOptions {
  baseUrl?: string;
  apiKey?: string;
  defaultFlowId?: string;
}

export interface LangflowInvocationPayload {
  flowId?: string;
  input: Record<string, unknown> | string;
  inputType?: string;
  outputType?: string;
  stream?: boolean;
  tweaks?: Record<string, unknown>;
}

interface LangflowOutputChunk {
  outputs?: Array<{
    type?: string;
    text?: string;
    data?: {
      text?: string;
      outputs?: Array<{ message?: { content?: string } }>;
    };
    message?: { content?: string };
  }>;
}

interface LangflowRunResponse {
  outputs?: LangflowOutputChunk[];
  error?: string;
  detail?: string;
}

export class LangflowClient {
  private readonly baseUrl?: string;
  private readonly apiKey?: string;
  readonly defaultFlowId?: string;

  constructor(options: LangflowClientOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.defaultFlowId = options.defaultFlowId;
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey && (this.defaultFlowId || true));
  }

  async runFlow(payload: LangflowInvocationPayload): Promise<unknown> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Langflow client is not configured");
    }

    const flowId = payload.flowId || this.defaultFlowId;
    if (!flowId) {
      throw new Error("Langflow flowId is required");
    }

    const url = new URL(`${this.baseUrl.replace(/\/$/, "")}/api/v1/run/${flowId}`);
    url.searchParams.set("stream", String(payload.stream ?? false));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        input_value: payload.input,
        input_type: payload.inputType ?? "structured",
        output_type: payload.outputType ?? "json",
        tweaks: payload.tweaks ?? {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Langflow API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as LangflowRunResponse;
    if (data.error) {
      throw new Error(`Langflow flow error: ${data.error}`);
    }

    return this.extractOutput(data);
  }

  async runJsonFlow(payload: LangflowInvocationPayload): Promise<unknown> {
    const raw = await this.runFlow(payload);
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      try {
        return JSON.parse(trimmed);
      } catch {
        throw new Error(`Langflow response is not valid JSON: ${trimmed.substring(0, 200)}`);
      }
    }
    return raw;
  }

  private extractOutput(data: LangflowRunResponse): unknown {
    if (!data.outputs || data.outputs.length === 0) {
      return data;
    }

    for (const outputChunk of data.outputs) {
      if (!outputChunk.outputs) continue;
      for (const inner of outputChunk.outputs) {
        if (inner.text) return inner.text;
        if (inner.data?.text) return inner.data.text;
        if (inner.message?.content) return inner.message.content;
        const firstMessage = inner.data?.outputs?.[0]?.message?.content;
        if (firstMessage) return firstMessage;
      }
    }

    return data;
  }
}
