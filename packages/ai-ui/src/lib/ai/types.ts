export type Role = "system" | "user" | "assistant";

export type AIMessage = {
  role: Role;
  content: string;
};

export type StreamHandlers = {
  onToken?: (t: string) => void;
  onDone?: (final: string) => void;
};

export interface AIClient {
  name: string;

  generate(opts: {
    model: string;
    prompt: string;
    temperature?: number;
  }): Promise<string>;

  chat(opts: {
    model: string;
    messages: AIMessage[];
    temperature?: number;
  }): Promise<string>;

  streamGenerate(
    prompt: string,
    handlers: StreamHandlers,
    opts?: { model: string; temperature?: number }
  ): Promise<void>;
}
