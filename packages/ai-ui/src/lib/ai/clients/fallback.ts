// src/lib/ai/clients/fallback.ts
import { type AIClient, type AIMessage, type StreamHandlers } from "../types";

export class FallbackClient implements AIClient {
  name: "openai" | "groq";

  private primary?: AIClient | null;
  private secondary?: AIClient | null;

  constructor(primary?: AIClient | null, secondary?: AIClient | null) {
    this.primary = primary ?? null;
    this.secondary = secondary ?? null;
    this.name = (this.primary?.name ?? this.secondary?.name)!;
  }

  private rethrow(e: unknown): never {
    throw e instanceof Error ? e : new Error(String(e));
  }

  async chat(opts: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }): Promise<string> {
    try {
      if (this.primary) {
        this.name = this.primary.name;
        return await this.primary.chat(opts);
      }
      throw new Error("No primary client");
    } catch (e) {
      if (this.secondary) {
        this.name = this.secondary.name;
        return this.secondary.chat(opts);
      }
      this.rethrow(e);
    }
  }

  async generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }): Promise<string> {
    try {
      if (this.primary) {
        this.name = this.primary.name;
        return await this.primary.generate(opts);
      }
      throw new Error("No primary client");
    } catch (e) {
      if (this.secondary) {
        this.name = this.secondary.name;
        return this.secondary.generate(opts);
      }
      this.rethrow(e);
    }
  }

  async streamChat(
    opts: {
      model: string;
      messages: AIMessage[];
      temperature?: number;
    } & StreamHandlers
  ): Promise<string> {
    try {
      if (this.primary) {
        this.name = this.primary.name;
        return await this.primary.streamChat(opts);
      }
      throw new Error("No primary client");
    } catch (e) {
      if (this.secondary) {
        this.name = this.secondary.name;
        return this.secondary.streamChat(opts);
      }
      this.rethrow(e);
    }
  }

  async streamGenerate(
    opts: {
      model: string;
      prompt: string;
      temperature?: number;
    } & StreamHandlers
  ): Promise<string> {
    try {
      if (this.primary) {
        this.name = this.primary.name;
        return await this.primary.streamGenerate(opts);
      }
      throw new Error("No primary client");
    } catch (e) {
      if (this.secondary) {
        this.name = this.secondary.name;
        return this.secondary.streamGenerate(opts);
      }
      this.rethrow(e);
    }
  }
}
