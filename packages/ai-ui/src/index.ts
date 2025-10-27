// CORE
export * from "./lib/ai/types";
export * from "./lib/ai/AIContext";
export * from "./lib/ai/AIProvider";
export * from "./lib/ai/useAI";

// Clients & utils
export * from "./lib/ai/clients/openai";
export * from "./lib/ai/clients/groq";
export * from "./lib/ai/utils/sse";

// UI basics
export * from "./components/ui/Button";
export * from "./components/ui/Card";

// Features
export { ChatBox } from "./components/ChatBox/ChatBox";
export { Summarizer } from "./components/Summarizer/Summarizer";
export { Translator } from "./components/Translator/Translator";
export { Rewriter } from "./components/Rewriter/Rewriter";

// Namespace (optional)
import { ChatBox } from "./components/ChatBox/ChatBox";
import { Summarizer } from "./components/Summarizer/Summarizer";
import { Translator } from "./components/Translator/Translator";
import { Rewriter } from "./components/Rewriter/Rewriter";
import { AIProvider } from "./lib/ai/AIProvider";
import { useAI } from "./lib/ai/useAI";

const AIUI = { ChatBox, Summarizer, Translator, Rewriter, AIProvider, useAI };
export default AIUI;
