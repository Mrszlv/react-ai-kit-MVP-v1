import {
  AIProvider,
  ChatBox,
  Summarizer,
  Translator,
  OpenAIClient,
  GroqClient,
  FallbackClient,
} from "@ai-ui/components";

const openaiKey = import.meta.env.VITE_OPENAI_KEY as string | undefined;
const groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;

const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
const groq = groqKey ? new GroqClient(groqKey) : null;
const client = new FallbackClient(openai, groq);
const defaultModel = openai
  ? import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini"
  : import.meta.env.VITE_GROQ_MODEL || "llama-3.1-8b-instant";

export default function App() {
  return (
    <AIProvider client={client} defaultModel={defaultModel}>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12 space-y-12">
          <h1 className="text-4xl font-bold text-indigo-700 text-center">
            Components Playground
          </h1>
          <ChatBox />
          <Summarizer />
          <Translator />
        </div>
      </main>
    </AIProvider>
  );
}
