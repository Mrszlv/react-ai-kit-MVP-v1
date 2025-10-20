import React, { useState } from "react";
import { useAI } from "../../lib/ai/useAI";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type LangCode =
  | "uk"
  | "en"
  | "pl"
  | "de"
  | "es"
  | "fr"
  | "it"
  | "pt"
  | "ru"
  | "tr";

const LANGS: Record<LangCode, string> = {
  uk: "Ukrainian",
  en: "English",
  pl: "Polish",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
};

function buildPrompt(
  text: string,
  lang: string,
  style: "short" | "bullets" | "detailed"
) {
  const styleLine =
    style === "bullets"
      ? "Return 3–7 concise bullet points."
      : style === "detailed"
      ? "Write 3–5 compact paragraphs."
      : "Keep it to 3–5 sentences.";

  return [
    "You are a professional summarizer.",
    "Requirements:",
    "- Respond strictly in the requested language.",
    "- Preserve important terminology and named entities.",
    "- Keep numbers/units intact.",
    "- If there is Markdown, preserve structure (headers, lists); do not translate code blocks or URLs.",
    styleLine,
    `Language: ${lang}.`,
    "",
    "Text to summarize:",
    text,
  ].join("\n");
}

export const Summarizer: React.FC<{
  defaultLang?: LangCode;
  defaultStyle?: "short" | "bullets" | "detailed";
  title?: string;
  placeholder?: string;
  buttonLabel?: string;
}> = ({
  defaultLang = "uk",
  defaultStyle = "short",
  title = "Summarizer",
  placeholder = "Paste text here…",
  buttonLabel = "Summarize",
}) => {
  const { generate, loading, error, provider } = useAI();
  const [lang, setLang] = useState<LangCode>(defaultLang);
  const [style, setStyle] = useState<"short" | "bullets" | "detailed">(
    defaultStyle
  );
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");

  async function onSummarize() {
    setOut("");
    const prompt = buildPrompt(input, LANGS[lang], style);
    const summary = await generate(prompt);
    setOut(summary);
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="ml-auto flex items-center gap-2">
          <select
            title="select"
            className="rounded-xl border px-3 py-2 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={style}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStyle(e.target.value as "short" | "bullets" | "detailed")
            }
            title="Summary style"
          >
            <option value="short">Short</option>
            <option value="bullets">Bulleted</option>
            <option value="detailed">Detailed</option>
          </select>

          {provider && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
              via {provider === "openai" ? "OpenAI" : "Groq"}
            </span>
          )}
        </div>
      </div>

      <textarea
        className="h-44 w-full resize-y rounded-xl border p-3 text-sm"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={loading || !input.trim()} onClick={onSummarize}>
          {loading ? "…" : buttonLabel}
        </Button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <div className="min-h-16 w-full whitespace-pre-wrap rounded-xl border bg-white/60 p-3 text-sm">
        {out || "Output will appear here"}
      </div>
    </Card>
  );
};
