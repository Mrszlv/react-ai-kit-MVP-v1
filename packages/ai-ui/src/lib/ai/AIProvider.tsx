import React, { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { AIContext, type AIContextType, type ProviderName } from "./AIContext";
import type { AIClient } from "./types";
import { OpenAIClient } from "./clients/openai";
import { GroqClient } from "./clients/groq";

const AIProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [provider, setProvider] = useState<ProviderName>("openai");

  const openaiKey = import.meta.env.VITE_OPENAI_KEY as string | undefined;
  const groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;

  const value = useMemo<AIContextType>(() => {
    const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
    const groq = groqKey ? new GroqClient(groqKey) : null;

    const active: AIClient | null =
      provider === "groq" ? groq ?? openai : openai ?? groq;

    const backup: AIClient | undefined =
      provider === "groq" ? openai ?? undefined : groq ?? undefined;

    const defaultModel =
      provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";

    if (!active) {
      throw new Error(
        "No AI client configured. Provide VITE_OPENAI_KEY or VITE_GROQ_KEY."
      );
    }

    return {
      client: active,
      fallback: backup,
      defaultModel,
      provider,
      setProvider,
    };
  }, [provider, openaiKey, groqKey]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export default AIProvider;
