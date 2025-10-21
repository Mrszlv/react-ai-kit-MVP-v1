import { ThemeProvider, ThemeToggle } from "./theme";
import { Tabs } from "./ui/Tabs";

// імпортуємо з твоєї бібліотеки
import {
  AIProvider,
  ChatBox,
  Summarizer,
  Translator,
  Rewriter,
  OpenAIClient,
  GroqClient,
  FallbackClient,
} from "@ai-ui/components";

const openaiKey = import.meta.env.VITE_OPENAI_KEY as string | undefined;
const groqKey = import.meta.env.VITE_GROQ_KEY as string | undefined;

// створюємо клієнти (будь-хто може бути відсутній)
const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
const groq = groqKey ? new GroqClient(groqKey) : null;
const client = new FallbackClient(openai, groq);

// типова модель (під Groq підійде "llama-3.1-8b-instant")
const defaultModel = openai ? "gpt-4o-mini" : "llama-3.1-8b-instant";

export default function App() {
  return (
    <ThemeProvider>
      <AIProvider client={client} defaultModel={defaultModel}>
        <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-slate-900/70 dark:border-slate-800">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <h1 className="text-2xl font-bold">
                <span className="text-indigo-600">AI-UI</span> Components —
                Playground
              </h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <a
                  href="https://github.com/Mrszlv/react-ai-kit-MVP-v1"
                  className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showcase ваших готових React-компонентів із інтегрованим AI: Chat,
              Summarizer, Translator, Rewriter.
            </p>

            <Tabs
              initialId="chat"
              tabs={[
                { id: "chat", label: "Chat", content: <ChatBox /> },
                { id: "sum", label: "Summarizer", content: <Summarizer /> },
                { id: "tr", label: "Translator", content: <Translator /> },
                { id: "rw", label: "Rewriter", content: <Rewriter /> },
              ]}
            />
          </section>

          <footer className="mt-12 border-t dark:border-slate-800">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AI-UI Components. Built with React,
              Vite, Tailwind.
            </div>
          </footer>
        </main>
      </AIProvider>
    </ThemeProvider>
  );
}
