import React from "react";
import AIUI from "@ai-ui/components";

export const ChatDemo: React.FC = () => {
  // Vite env (тільки для демо-додатку, не для бібліотеки)
  const openaiKey = import.meta.env.VITE_OPENAI_KEY as string | undefined;
  const groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;

  // можеш керувати провайдером через env, або залишити auto
  const provider =
    (import.meta.env.VITE_AI_PROVIDER as "openai" | "groq" | undefined) ??
    (openaiKey ? "openai" : groqKey ? "groq" : undefined);

  return (
    <AIUI.LicenseProvider licenseKey="mrszlv_demo_public_1">
      <AIUI.AIProvider
        initialProvider={provider}
        openaiKey={openaiKey}
        groqKey={groqKey}
      >
        <AIUI.ChatBox />
      </AIUI.AIProvider>
    </AIUI.LicenseProvider>
  );
};
