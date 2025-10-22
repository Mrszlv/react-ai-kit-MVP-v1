import type { AIClient, AIMessage } from "../types";
import { readOpenAISSE } from "../utils/sse";

export class GroqClient implements AIClient {
  readonly name = "groq" as const;
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

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
      throw new Error(`Groq error ${res.status}: ${await res.text()}`);
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
    // Мапінг моделей, якщо треба
    if (model.startsWith("gpt-") || model.startsWith("o1-")) {
      model = "llama-3.1-8b-instant";
    }
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
    if (model.startsWith("gpt-") || model.startsWith("o1-")) {
      model = "llama-3.1-8b-instant";
    }
    return this.postChat({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    });
  }

  async streamGenerate(
    {
      model,
      prompt,
      temperature = 0.7,
    }: { model: string; prompt: string; temperature?: number },
    handlers: { onToken?: (t: string) => void; onDone?: (full: string) => void }
  ): Promise<void> {
    if (model.startsWith("gpt-") || model.startsWith("o1-")) {
      model = "llama-3.1-8b-instant";
    }
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}`);

    let full = "";
    await readOpenAISSE(res, (delta) => {
      if (typeof delta === "string") {
        full += delta;
        handlers.onToken?.(delta);
      }
    });
    handlers.onDone?.(full);
  }
}
