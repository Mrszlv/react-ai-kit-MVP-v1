import type { AIClient, AIMessage } from "../types";
import { readOpenAISSE } from "../utils/sse";

export class OpenAIClient implements AIClient {
  readonly name = "openai" as const;
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async postChat(payload: unknown): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(`OpenAI error ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  async chat({
    model,
    messages,
    temperature = 0.7,
  }: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }): Promise<string> {
    return this.postChat({ model, messages, temperature });
  }

  async generate({
    model,
    prompt,
    temperature = 0.7,
  }: {
    model: string;
    prompt: string;
    temperature?: number;
  }): Promise<string> {
    return this.postChat({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    });
  }

  async streamChat({
    model,
    messages,
    temperature = 0.7,
    onToken,
    onDone,
  }: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
    onToken?: (t: string) => void;
    onDone?: (s: string) => void;
  }): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, stream: true }),
    });
    if (!res.ok)
      throw new Error(`OpenAI error ${res.status} ${await res.text()}`);
    const full = await readOpenAISSE(res, (t) => onToken?.(t));
    onDone?.(full);
    return full;
  }

  async streamGenerate({
    model,
    prompt,
    temperature = 0.7,
    onToken,
    onDone,
  }: {
    model: string;
    prompt: string;
    temperature?: number;
    onToken?: (t: string) => void;
    onDone?: (s: string) => void;
  }): Promise<string> {
    return this.streamChat({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      onToken,
      onDone,
    });
  }
}
