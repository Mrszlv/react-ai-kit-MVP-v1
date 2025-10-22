export * from "./components/ChatBox/ChatBox";
export * from "./components/Summarizer/Summarizer";
export * from "./components/Translator/Translator";
export * from "./components/Rewriter/Rewriter";
export * from "./components/ui/Button";
export * from "./components/ui/Card";
export * from "./lib/ai/AIProvider";
export * from "./lib/ai/useAI";
export * from "./lib/ai/types";
export * from "./lib/i18n/langs";

// Контекст / хук
export * from "./lib/ai/AIProvider";
export * from "./lib/ai/useAI";

// Клієнти (класи)
export { OpenAIClient } from "./lib/ai/clients/openai";
export { GroqClient } from "./lib/ai/clients/groq";

// (за потреби) fallback-композитор
export { FallbackClient } from "./lib/ai/clients/fallback";
