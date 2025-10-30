import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const Summarizer: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [src, setSrc] = useState("");

  const [out, setOut] = useState("");

  const [style, setStyle] = useState("Bulleted");

  const [lang, setLang] = useState("English");

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

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, lang, style);
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final),
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          📝 Summarizer
        </h3>

        <div className="ml-auto flex items-center gap-2">
          <select
            title="selectSummizer"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {[
              "Ukrainian",
              "English",
              "Polish",
              "German",
              "Spanish",
              "French",
              "Italian",
              "Portuguese",
              "Russian",
              "Turkish",
            ].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            title="selectSummizer"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Bulleted">Bulleted</option>
            <option value="Paragraph">Paragraph</option>
            <option value="Compact">Compact</option>
          </select>
        </div>
      </div>

      <textarea
        className="h-40 w-full resize-none rounded-xl border p-3 text-sm
                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400
                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder="Paste text here…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={loading || !src.trim()} onClick={run}>
          {loading ? "…" : "Summarize"}
        </Button>
      </div>

      <div
        className="min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm
                      border-slate-200 bg-white/70 text-slate-900
                      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
      >
        {out || "Output will appear here"}
      </div>

      <div className="flex items-center gap-3">
        {provider && (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            via {provider}
          </span>
        )}
        {error && <p className="text-xs text-slate-400">{error}</p>}
      </div>
    </Card>
  );
};
