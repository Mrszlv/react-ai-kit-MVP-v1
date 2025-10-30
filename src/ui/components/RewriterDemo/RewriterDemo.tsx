import React from "react";
import AIUI from "@ai-ui/components";

export const RewriterDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.Rewriter />
    </AIUI.AIProvider>
  );
};
