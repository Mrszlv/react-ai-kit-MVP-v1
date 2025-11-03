// публічні експорти з ліби
export * from "./lib/ai/types";
export * from "./lib/ai/AIContext";
export * from "./lib/ai/useAI";

export * from "./lib/ai/clients/openai";
export * from "./lib/ai/clients/groq";
export * from "./lib/ai/utils/sse";

export * from "./components/ui/Button";
export * from "./components/ui/Card";

// іменовані експорти React-компонентів
export { ChatBox } from "./components/ChatBox/ChatBox";
export { Summarizer } from "./components/Summarizer/Summarizer";
export { Translator } from "./components/Translator/Translator";
export { Rewriter } from "./components/Rewriter/Rewriter";

// 👇 ось тут головне: ми знаємо, що AIProvider — дефолтний в AIProvider.tsx
import AIProviderDefault from "./lib/ai/AIProvider";

// даємо йому іменований експорт з пакета
export { AIProviderDefault as AIProvider };

// далі — імпорти тільки щоб зібрати дефолтний об’єкт
import { ChatBox as ChatBoxComp } from "./components/ChatBox/ChatBox";
import { Summarizer as SummarizerComp } from "./components/Summarizer/Summarizer";
import { Translator as TranslatorComp } from "./components/Translator/Translator";
import { Rewriter as RewriterComp } from "./components/Rewriter/Rewriter";
import { useAI as useAIHook } from "./lib/ai/useAI";

const AIUI = {
  ChatBox: ChatBoxComp,
  Summarizer: SummarizerComp,
  Translator: TranslatorComp,
  Rewriter: RewriterComp,
  AIProvider: AIProviderDefault,
  useAI: useAIHook,
};

export default AIUI;
