import type { AIClient, StreamHandlers } from "../types";

export class FallbackClient implements AIClient {
  readonly name: "openai" | "groq";
  private primary?: AIClient;
  private secondary?: AIClient;

  constructor(primary?: AIClient, secondary?: AIClient) {
    this.primary = primary;
    this.secondary = secondary;

    const n = primary?.name ?? secondary?.name;
    if (!n) throw new Error("No AI client configured for FallbackClient");
    this.name = n as "openai" | "groq";
  }

  private get active(): AIClient {
    if (this.primary) return this.primary;
    if (this.secondary) return this.secondary!;
    throw new Error("No AI client configured");
  }

  async chat(opts: { model: string; messages: any[]; temperature?: number }) {
    try {
      return await this.active.chat(opts);
    } catch (err) {
      if (this.secondary) return this.secondary.chat(opts);
      throw err;
    }
  }

  async generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }) {
    try {
      return await this.active.generate(opts);
    } catch (err) {
      if (this.secondary) return this.secondary.generate(opts);
      throw err;
    }
  }

  async streamGenerate(
    opts: { model: string; prompt: string; temperature?: number },
    handlers: StreamHandlers
  ): Promise<void> {
    try {
      await this.active.streamGenerate(opts, handlers);
    } catch (err) {
      if (this.secondary) {
        await this.secondary.streamGenerate(opts, handlers);
        return;
      }
      throw err;
    }
  }
}
