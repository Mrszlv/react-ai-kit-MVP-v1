import React from "react";
import { Summarizer } from "@ai-ui/components";
import { DemoAIProvider } from "../DemoAIProvider";

export const SummarizerDemo: React.FC = () => {
  return (
    <DemoAIProvider>
      <Summarizer />
    </DemoAIProvider>
  );
};
