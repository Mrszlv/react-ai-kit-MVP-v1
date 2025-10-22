import React from "react";
import { ChatBox } from "@ai-ui/components";
import { DemoAIProvider } from "../DemoAIProvider";

export const ChatDemo: React.FC = () => {
  return (
    <DemoAIProvider>
      <ChatBox />
    </DemoAIProvider>
  );
};
