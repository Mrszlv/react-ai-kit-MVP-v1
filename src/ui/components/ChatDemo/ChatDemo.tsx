import React from "react";
import AIUI from "@ai-ui/components";

export const ChatDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.ChatBox />
    </AIUI.AIProvider>
  );
};
