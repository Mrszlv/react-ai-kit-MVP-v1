// src/ui/DemoAIProvider.tsx
import React, { useMemo } from "react";
import {
  AIProvider,
  OpenAIClient,
  GroqClient,
  FallbackClient,
} from "@ai-ui/components";

export const DemoAIProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const openai = useMemo(
    () => new OpenAIClient(import.meta.env.VITE_OPENAI_KEY || ""),
    []
  );
  const groq = useMemo(
    () => new GroqClient(import.meta.env.VITE_GROQ_KEY || ""),
    []
  );

  const client = useMemo(
    () => new FallbackClient(openai, groq),
    [openai, groq]
  );

  return (
    <AIProvider client={client} defaultModel="gpt-4o-mini">
      {children}
    </AIProvider>
  );
};
