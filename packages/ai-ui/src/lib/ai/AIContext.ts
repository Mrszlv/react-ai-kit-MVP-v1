import { createContext, useContext } from "react";

import type { AIClient } from "./types";

export type AIConfig = { client: AIClient; defaultModel: string };

export const AIContext = createContext<AIConfig | null>(null);

export const useAIContext = (): AIConfig => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAIContext must be used inside <AIProvider>");
  return ctx;
};
