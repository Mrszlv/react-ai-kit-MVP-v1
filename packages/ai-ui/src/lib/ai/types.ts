export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamHandlers = {
  onToken?: (t: string) => void;
  onDone?: (full: string) => void;
};

export interface AIClient {
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

  streamGenerate(
    opts: { model: string; prompt: string; temperature?: number },
    handlers: StreamHandlers
  ): Promise<void>;
}
