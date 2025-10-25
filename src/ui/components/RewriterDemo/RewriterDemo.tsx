import React from "react";
import AIUI from "@ai-ui/components"; // ← дефолтний імпорт (AIUI — об’єкт)

export const RewriterDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.Rewriter />
    </AIUI.AIProvider>
  );
};
