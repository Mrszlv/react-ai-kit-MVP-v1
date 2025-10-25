import type { AIClient, AIMessage } from "../types";
import { readOpenAISSE } from "../utils/sse";

export class GroqClient implements AIClient {
  name = "groq" as const;
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private headers(stream = false) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...(stream ? { Accept: "text/event-stream" } : {}),
    };
  }

  private mapModel(model: string) {
    return model.startsWith("gpt") || model.startsWith("o1")
      ? "llama-3.1-8b-instant"
      : model;
  }

  async generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: this.mapModel(opts.model),
        temperature: opts.temperature ?? 0.7,
        messages: [{ role: "user", content: opts.prompt }],
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }

  async chat(opts: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: this.mapModel(opts.model),
        temperature: opts.temperature ?? 0.7,
        messages: opts.messages,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }

  async streamGenerate(
    prompt: string,
    handlers: {
      onToken?: (t: string) => void;
      onDone?: (final: string) => void;
    },
    opts?: { model: string; temperature?: number }
  ) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: this.mapModel(opts?.model ?? "llama-3.1-8b-instant"),
        temperature: opts?.temperature ?? 0.7,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });
    if (!res.ok) throw new Error(await res.text());

    const full = await readOpenAISSE(res, (chunk) => handlers.onToken?.(chunk));
    handlers.onDone?.(full);
  }
}
