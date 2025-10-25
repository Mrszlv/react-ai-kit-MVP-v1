import React from "react";
import AIUI from "@ai-ui/components"; // ← дефолтний імпорт (AIUI — об’єкт)

export const ChatDemo: React.FC = () => {
  return (
    <AIUI.AIProvider>
      <AIUI.ChatBox />
    </AIUI.AIProvider>
  );
};
