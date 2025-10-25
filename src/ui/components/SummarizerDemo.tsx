import React from "react";
import AIUI from "@ai-ui/components"; // ← дефолтний імпорт (AIUI — об’єкт)

export const SummarizerDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.Summarizer />
    </AIUI.AIProvider>
  );
};
