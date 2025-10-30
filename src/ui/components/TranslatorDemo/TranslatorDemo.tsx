import React from "react";
import AIUI from "@ai-ui/components";

export const TranslatorDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.Translator />
    </AIUI.AIProvider>
  );
};
