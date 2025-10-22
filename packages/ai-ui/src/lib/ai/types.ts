// packages/ai-ui/src/lib/ai/types.ts
export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamHandlers = {
  onToken?: (t: string) => void;
  onDone?: (full: string) => void;
};

export interface AIClient {
  /** Ім'я провайдера для бейджа/відладки */
  name: "openai" | "groq";

  chat(opts: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }): Promise<string>;

  generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }): Promise<string>;

  /** Стрімовий генератор — УВАГА: два аргументи */
  streamGenerate(
    opts: { model: string; prompt: string; temperature?: number },
    handlers: StreamHandlers
  ): Promise<void>;
}
