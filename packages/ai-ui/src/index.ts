export * from "./lib/ai/types";
export * from "./lib/ai/AIContext";
export * from "./lib/ai/AIProvider";
export * from "./lib/ai/useAI";

export * from "./lib/ai/clients/openai";
export * from "./lib/ai/clients/groq";
export * from "./lib/ai/utils/sse";

export * from "./components/ui/Button";
export * from "./components/ui/Card";

export * from "./components/ChatBox/ChatBox";
export * from "./components/Summarizer/Summarizer";
export * from "./components/Translator/Translator";
export * from "./components/Rewriter/Rewriter";

import { ChatBox } from "./components/ChatBox/ChatBox";
import { Summarizer } from "./components/Summarizer/Summarizer";
import { Translator } from "./components/Translator/Translator";
import { Rewriter } from "./components/Rewriter/Rewriter";
import { AIProvider } from "./lib/ai/AIProvider";
import { useAI } from "./lib/ai/useAI";

const AIUI = {
  ChatBox,
  Summarizer,
  Translator,
  Rewriter,
  AIProvider,
  useAI,
};

export default AIUI;
