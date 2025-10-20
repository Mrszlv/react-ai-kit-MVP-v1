export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamHandlers = {
  onToken?: (t: string) => void;
  onDone?: (full: string) => void;
};

export interface AIClient {
  /** ім’я провайдера, щоб показувати бейдж */
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

  /** стрімінгова версія (через SSE) */
  streamChat(
    opts: {
      model: string;
      messages: AIMessage[];
      temperature?: number;
    } & StreamHandlers
  ): Promise<string>;

  streamGenerate(
    opts: {
      model: string;
      prompt: string;
      temperature?: number;
    } & StreamHandlers
  ): Promise<string>;
}
