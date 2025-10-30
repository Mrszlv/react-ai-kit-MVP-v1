import { useState } from "react";
import type { AIMessage } from "./types";
import { useAIContext } from "./AIContext";

export function useAI(defaultModel?: string) {
  const {
    client,
    fallback,
    defaultModel: ctxModel,
    provider,
    setProvider,
  } = useAIContext();
  const model = defaultModel ?? ctxModel;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withFallback<T>(
    fn: (c: typeof client) => Promise<T>
  ): Promise<T> {
    try {
      return await fn(client);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : String(e ?? "Unknown error");

      if (fallback && provider === "openai") {
        const shouldFallback = /429|401|5\d\d|rate|quota|network|fetch/i.test(
          message
        );
        if (shouldFallback) {
          setProvider("groq");
          setError("falling back to groq ai provider");
          return await fn(fallback);
        }
      }

      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  async function chat(messages: AIMessage[], temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await withFallback((c) =>
        c.chat({ model, messages, temperature })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
      return "";
    } finally {
      setLoading(false);
    }
  }

  async function generate(prompt: string, temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await withFallback((c) =>
        c.generate({ model, prompt, temperature })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
      return "";
    } finally {
      setLoading(false);
    }
  }

  async function streamGenerate(
    prompt: string,
    handlers: {
      onToken?: (t: string) => void;
      onDone?: (final: string) => void;
    },
    temperature = 0.7
  ) {
    setLoading(true);
    setError(null);
    try {
      await withFallback((c) =>
        c.streamGenerate(prompt, handlers, { model, temperature })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return {
    chat,
    generate,
    streamGenerate,

    loading,
    error,
    provider,
  };
}
