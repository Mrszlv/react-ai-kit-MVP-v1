import React from "react";
import { Translator } from "@ai-ui/components";
import { DemoAIProvider } from "../DemoAIProvider";

export const TranslatorDemo: React.FC = () => {
  return (
    <DemoAIProvider>
      <Translator />
    </DemoAIProvider>
  );
};
