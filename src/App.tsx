import { AIProvider } from "./lib/ai/AIProvider";
import { OpenAIClient } from "./lib/ai/clients/openai";
import { ChatBox } from "./components/ChatBox/ChatBox";
import { Summarizer } from "./components/Summarizer/Summarizer";
import { Translator } from "./components/Translator/Translator";
import { GroqClient } from "./lib/ai/clients/groq";
import { FallbackClient } from "./lib/ai/clients/fallback";

const openaiKey = import.meta.env.VITE_OPENAI_KEY as string | undefined;
const groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;

const defaultOpenAIModel =
  (import.meta.env.VITE_OPENAI_MODEL as string) || "gpt-4o-mini";
const defaultGroqModel =
  (import.meta.env.VITE_GROQ_MODEL as string) || "llama-3.1-8b-instant";

// Створюємо клієнти, якщо є ключі
const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
const groq = groqKey ? new GroqClient(groqKey) : null;

// Гібрид: спочатку OpenAI → потім Groq; якщо OpenAI нема — одразу Groq
const client = new FallbackClient(openai, groq);

const DEFAULT_MODEL = openai ? defaultOpenAIModel : defaultGroqModel;

export default function App() {
  return (
    <AIProvider client={client} defaultModel={DEFAULT_MODEL}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-10 text-center text-4xl font-bold text-indigo-700">
            Components Playground
          </h1>

          <div className="space-y-10">
            <ChatBox />
            <Summarizer />
            <Translator />
          </div>
        </div>
      </main>
    </AIProvider>
  );
}
