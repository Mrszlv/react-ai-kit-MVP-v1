import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { LANGS } from "../../lib/i18n/langs";
import type { LangCode } from "../../lib/i18n/langs";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function buildPrompt(text: string, language: string, format: string) {
  return [
    `You are a professional text summarizer that produces ${format.toLowerCase()} summaries in ${language}.`,
    "Rules:",
    "- Preserve meaning and tone.",
    "- Avoid changing facts.",
    "- Keep formatting consistent (Markdown allowed).",
    "- Use bullet points if requested.",
    "- Output only the summary text.",
    "",
    "Text:",
    text,
  ].join("\n");
}

export const Summarizer: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");
  const [lang, setLang] = useState<LangCode>("en");
  const [style, setStyle] = useState("Bulleted");

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, LANGS[lang], style);
    await streamGenerate(prompt, {
      onToken: (t) => setOut((prev) => prev + t),
      onDone: (final) => setOut(final),
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">📝 Summarizer</h3>

        <div className="ml-auto flex items-center gap-2">
          <select
            title="summaizer"
            className="rounded-xl border px-3 py-2 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          <select
            title="Summary style"
            className="rounded-xl border px-3 py-2 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Bulleted">Bulleted</option>
            <option value="Paragraph">Paragraph</option>
            <option value="Compact">Compact</option>
          </select>

          {provider && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
              via {provider === "openai" ? "OpenAI" : "Groq"}
            </span>
          )}
        </div>
      </div>

      <textarea
        className="h-40 w-full resize-none rounded-xl border p-3 text-sm"
        placeholder="Paste text here…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={loading || !src.trim()} onClick={run}>
          {loading ? "…" : "Summarize"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="min-h-16 w-full whitespace-pre-wrap rounded-xl border bg-white/60 p-3 text-sm">
        {out || "Output will appear here"}
      </div>
    </Card>
  );
};
