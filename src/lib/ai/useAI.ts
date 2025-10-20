import { useState } from "react";
import { useAIContext } from "./AIContext";
import type { AIMessage } from "./types";

export function useAI(model?: string) {
  const { client, defaultModel } = useAIContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<"openai" | "groq" | null>(null);

  async function chat(messages: AIMessage[]): Promise<string> {
    setLoading(true);
    setError(null);
    setProvider(client.name);
    try {
      return await client.chat({ model: model ?? defaultModel, messages });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setError(m);
      return "";
    } finally {
      setProvider(client.name);
      setLoading(false);
    }
  }

  async function generate(prompt: string): Promise<string> {
    setLoading(true);
    setError(null);
    setProvider(client.name);
    try {
      return await client.generate({ model: model ?? defaultModel, prompt });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setError(m);
      return "";
    } finally {
      setProvider(client.name);
      setLoading(false);
    }
  }

  // нове: стрімінг
  async function generateStream(
    prompt: string,
    onToken: (t: string) => void,
    onDone?: (full: string) => void
  ): Promise<string> {
    setLoading(true);
    setError(null);
    setProvider(client.name);
    try {
      const full = await client.streamGenerate({
        model: model ?? defaultModel,
        prompt,
        onToken,
        onDone,
      });
      return full;
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setError(m);
      return "";
    } finally {
      setProvider(client.name);
      setLoading(false);
    }
  }

  return { chat, generate, generateStream, loading, error, provider };
}
