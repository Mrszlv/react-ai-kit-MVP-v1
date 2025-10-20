import { useState } from "react";
import { useAIContext } from "./AIContext";
import type { AIMessage } from "./types";

export function useAI(model?: string) {
  const { client, defaultModel } = useAIContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function chat(messages: AIMessage[]) {
    setLoading(true);
    setError(null);
    try {
      return await client.chat({ model: model ?? defaultModel, messages });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      return "";
    } finally {
      setLoading(false);
    }
  }

  async function generate(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      return await client.generate({ model: model ?? defaultModel, prompt });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      return "";
    } finally {
      setLoading(false);
    }
  }

  // ✅ нове: стрімінг токенів
  async function streamGenerate(
    prompt: string,
    handlers?: {
      onToken?: (t: string) => void;
      onDone?: (final: string) => void;
    }
  ) {
    setLoading(true);
    setError(null);
    try {
      const final = await client.streamGenerate({
        model: model ?? defaultModel,
        prompt,
        onToken: (t) => handlers?.onToken?.(t),
        onDone: (finalTxt) => handlers?.onDone?.(finalTxt),
      });
      return final;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      return "";
    } finally {
      setLoading(false);
    }
  }

  // provider для бейджика (openai|groq)
  const provider = client.name;

  return { chat, generate, streamGenerate, loading, error, provider };
}
