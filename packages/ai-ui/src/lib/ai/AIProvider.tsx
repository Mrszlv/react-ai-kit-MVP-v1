import React, { useMemo, useState } from "react";
import { AIProviderBase, type ProviderName } from "./AIContext";
import { OpenAIClient } from "./clients/openai";
import { GroqClient } from "./clients/groq";

export const AIProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [provider, setProvider] = useState<ProviderName>("openai");

  const openaiKey = import.meta.env.VITE_OPENAI_KEY as string;
  const groqKey = import.meta.env.VITE_GROQ_KEY as string;

  const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
  const groq = groqKey ? new GroqClient(groqKey) : null;

  const value = useMemo(() => {
    const active = provider === "groq" ? groq ?? openai! : openai ?? groq!;
    const backup =
      provider === "groq" ? openai ?? undefined : groq ?? undefined;
    const defaultModel =
      provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";
    return {
      client: active!,
      fallback: backup,
      defaultModel,
      provider,
      setProvider,
    };
  }, [provider, openai, groq]);

  return <AIProviderBase value={value}>{children}</AIProviderBase>;
};
