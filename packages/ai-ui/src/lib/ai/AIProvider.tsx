import React, { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { AIContext, type AIContextType, type ProviderName } from "./AIContext";
import type { AIClient } from "./types";
import { OpenAIClient } from "./clients/openai";
import { GroqClient } from "./clients/groq";

type EnvLike = Record<string, string | undefined>;

type AIProviderProps = PropsWithChildren<{
  openaiKey?: string;
  openaiModel?: string;
  groqKey?: string;
  groqModel?: string;
  initialProvider?: ProviderName;
}>;

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function fromVite(name: string): string | undefined {
  // без any та без порожніх блоків
  const env = (import.meta as unknown as { env?: EnvLike }).env;
  return env ? env[name] : undefined;
}

function fromNode(name: string): string | undefined {
  const env =
    typeof process !== "undefined"
      ? (process as unknown as { env?: EnvLike }).env
      : undefined;
  return env ? env[name] : undefined;
}

function fromGlobal(name: string): string | undefined {
  const env = (globalThis as unknown as { __AIUI_ENV?: EnvLike }).__AIUI_ENV;
  return env ? env[name] : undefined;
}

function readEnv(name: string): string | undefined {
  return fromVite(name) ?? fromNode(name) ?? fromGlobal(name);
}

const AIProvider: React.FC<AIProviderProps> = ({
  children,
  openaiKey,
  openaiModel,
  groqKey,
  groqModel,
  initialProvider,
}) => {
  const [provider, setProvider] = useState<ProviderName>(
    initialProvider ?? (readEnv("VITE_AI_PROVIDER") as ProviderName) ?? "openai"
  );

  // props → env
  const resolvedOpenAIKey = openaiKey ?? readEnv("VITE_OPENAI_KEY");
  const resolvedGroqKey = groqKey ?? readEnv("VITE_GROQ_KEY");
  const resolvedOpenAIModel =
    openaiModel ?? readEnv("VITE_OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL;
  const resolvedGroqModel =
    groqModel ?? readEnv("VITE_GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;

  const value = useMemo<AIContextType>(() => {
    const openai: AIClient | null = resolvedOpenAIKey
      ? new OpenAIClient(resolvedOpenAIKey)
      : null;
    const groq: AIClient | null = resolvedGroqKey
      ? new GroqClient(resolvedGroqKey)
      : null;

    const active: AIClient | null =
      provider === "groq" ? groq ?? openai : openai ?? groq;

    const backup: AIClient | undefined =
      provider === "groq" ? openai ?? undefined : groq ?? undefined;

    const defaultModel =
      provider === "groq" ? resolvedGroqModel : resolvedOpenAIModel;

    if (!active) {
      throw new Error(
        "No AI client configured. Pass keys via props (openaiKey/groqKey) або встанови VITE_OPENAI_KEY / VITE_GROQ_KEY."
      );
    }

    return {
      client: active,
      fallback: backup,
      defaultModel,
      provider,
      setProvider,
    };
  }, [
    provider,
    resolvedOpenAIKey,
    resolvedGroqKey,
    resolvedOpenAIModel,
    resolvedGroqModel,
  ]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export default AIProvider;
