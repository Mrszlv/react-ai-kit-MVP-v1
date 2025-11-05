import React from "react";
import AIUI from "@ai-ui/components";

export const SummarizerDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.Summarizer />
    </AIUI.AIProvider>
  );
};
