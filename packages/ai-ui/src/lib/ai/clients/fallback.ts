import type { AIClient, AIMessage, StreamHandlers } from "../types";

export class FallbackClient implements AIClient {
  readonly name = "fallback" as const;

  constructor(private primary: AIClient, private secondary?: AIClient) {}

  private pick(model: string) {
    if (!model.includes("fallback")) return this.primary;
    return this.primary ?? this.secondary;
  }

  async chat(opts: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }): Promise<string> {
    const client = this.pick(opts.model);
    if (!client) throw new Error("No active AI client configured");

    try {
      return await client.chat(opts);
    } catch (e: any) {
      if (this.secondary && (e?.status === 429 || e?.name === "TypeError")) {
        return this.secondary.chat(opts);
      }
      throw e;
    }
  }

  async generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }): Promise<string> {
    const client = this.pick(opts.model);
    if (!client) throw new Error("No active AI client configured");

    try {
      return await client.generate(opts);
    } catch (e: any) {
      if (this.secondary && (e?.status === 429 || e?.name === "TypeError")) {
        return this.secondary.generate(opts);
      }
      throw e;
    }
  }

  async streamGenerate(
    opts: { model: string; prompt: string; temperature?: number | undefined },
    handlers: StreamHandlers
  ): Promise<void> {
    const client = this.pick(opts.model);
    if (!client) throw new Error("No active AI client configured");

    try {
      await client.streamGenerate(opts, handlers);
    } catch (e: any) {
      if (this.secondary && (e?.status === 429 || e?.name === "TypeError")) {
        await this.secondary.streamGenerate(opts, handlers);
        return;
      }
      throw e;
    }
  }
}
