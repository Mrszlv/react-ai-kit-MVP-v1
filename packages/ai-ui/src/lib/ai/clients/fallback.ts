import type { AIClient, StreamHandlers, AIMessage } from "../types";

type GenerateOpts = {
  model: string;
  prompt: string;
  temperature?: number;
};

type ChatOpts = {
  model: string;
  messages: AIMessage[];
  temperature?: number;
};

type StreamOpts = {
  model: string;
  temperature?: number;
};

export class FallbackClient implements AIClient {
  public readonly name = "fallback";

  constructor(
    private readonly registry: {
      openai?: AIClient;
      groq?: AIClient;
      [key: string]: AIClient | undefined;
    },
    private readonly defaultModel: string
  ) {}

  private pick(model?: string): AIClient | null {
    const m = (model ?? this.defaultModel ?? "").toLowerCase();

    if (m.startsWith("gpt") || m.includes("o")) {
      if (this.registry.openai) return this.registry.openai;
    }
    if (m.startsWith("groq") || m.includes("llama")) {
      if (this.registry.groq) return this.registry.groq;
    }

    return this.registry.openai ?? this.registry.groq ?? null;
  }

  async generate(opts: GenerateOpts): Promise<string> {
    const client = this.pick(opts.model);
    if (!client) throw new Error("No active AI client configured");
    return client.generate(opts);
  }

  async chat(opts: ChatOpts): Promise<string> {
    const client = this.pick(opts.model);
    if (!client) throw new Error("No active AI client configured");
    return client.chat(opts);
  }

  async streamGenerate(
    prompt: string,
    handlers: StreamHandlers,
    opts?: StreamOpts
  ): Promise<void> {
    const client = this.pick(opts?.model);
    if (!client) throw new Error("No active AI client configured");
    return client.streamGenerate(prompt, handlers, opts);
  }
}
