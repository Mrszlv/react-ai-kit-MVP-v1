import React from "react";
import { Rewriter } from "@ai-ui/components";
import { DemoAIProvider } from "../DemoAIProvider";

export const RewriterDemo: React.FC = () => {
  return (
    <DemoAIProvider>
      <Rewriter />
    </DemoAIProvider>
  );
};
