import React, { createContext, useContext } from "react";
import type { AIClient } from "./types";

/* eslint-disable react-refresh/only-export-components */

export type ProviderName = "openai" | "groq";

export type AIContextType = {
  client: AIClient;

  fallback?: AIClient;

  defaultModel: string;

  provider: ProviderName;

  setProvider: (p: ProviderName) => void;
};

export const AIContext = createContext<AIContextType | null>(null);

export const AIProviderBase: React.FC<
  React.PropsWithChildren<{ value: AIContextType }>
> = ({ value, children }) => {
  return React.createElement(AIContext.Provider, { value }, children);
};

export function useAIContext(): AIContextType {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAIContext must be used inside <AIProvider>");
  return ctx;
}
