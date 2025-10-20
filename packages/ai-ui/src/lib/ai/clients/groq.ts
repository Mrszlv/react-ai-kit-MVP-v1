import type { AIClient, AIMessage } from "../types";
import { readOpenAISSE } from "../utils/sse";

export class GroqClient implements AIClient {
  readonly name = "groq" as const;
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private mapModel(model: string) {
    // якщо передали OpenAI-модель — замінюємо
    if (model.startsWith("gpt-") || model.startsWith("o1-"))
      return "llama-3.1-8b-instant";
    return model;
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
      throw new Error(`Groq error ${res.status} ${await res.text()}`);
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
    return this.postChat({
      model: this.mapModel(model),
      messages,
      temperature,
    });
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
      model: this.mapModel(model),
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
      body: JSON.stringify({
        model: this.mapModel(model),
        messages,
        temperature,
        stream: true,
      }),
    });
    if (!res.ok)
      throw new Error(`Groq error ${res.status} ${await res.text()}`);
    const full = await readOpenAISSE(res, (t) => onToken?.(t));
    onDone?.(full);
    return full;
  }

  async streamGenerate(args: {
    model: string;
    prompt: string;
    temperature?: number;
    onToken?: (t: string) => void;
    onDone?: (s: string) => void;
  }) {
    const { model, prompt, temperature = 0.7, onToken, onDone } = args;
    return this.streamChat({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      onToken,
      onDone,
    });
  }
}
