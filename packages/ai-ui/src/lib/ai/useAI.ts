// packages/ai-ui/src/lib/ai/useAI.ts
import { useState } from "react";
import { useAIContext } from "./AIContext";
import type { AIMessage } from "./types";

export function useAI(model?: string) {
  const { client, defaultModel } = useAIContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider: "openai" | "groq" | null =
    (client && (client as any).name) || null;

  async function chat(messages: AIMessage[], temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await client.chat({
        model: model ?? defaultModel,
        messages,
        temperature,
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
      return "";
    } finally {
      setLoading(false);
    }
  }

  async function generate(prompt: string, temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await client.generate({
        model: model ?? defaultModel,
        prompt,
        temperature,
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
      return "";
    } finally {
      setLoading(false);
    }
  }

  async function streamGenerate(
    prompt: string,
    handlers: {
      onToken?: (t: string) => void;
      onDone?: (finalTxt: string) => void;
    },
    temperature = 0.7
  ) {
    setLoading(true);
    setError(null);
    try {
      await client.streamGenerate(
        { model: model ?? defaultModel, prompt, temperature },
        {
          onToken: (t: string) => handlers.onToken?.(t),
          onDone: (finalTxt: string) => handlers.onDone?.(finalTxt),
        }
      );
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return { chat, generate, streamGenerate, loading, error, provider };
}
