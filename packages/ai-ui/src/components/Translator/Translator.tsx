import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function buildPrompt(text: string, from: string, to: string) {
  return [
    `You are a precise translator from ${from} to ${to}.`,
    "Rules:",
    "- Respond strictly in the target language.",
    "- Preserve meaning, tone, and named entities.",
    "- Keep emojis, punctuation, and Markdown structure.",
    "- Do NOT translate code, URLs, or domain names.",
    "- Keep line breaks and formatting.",
    "",
    "Text:",
    text,
  ].join("\n");
}

export const Translator: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [from, setFrom] = useState("Ukrainian");

  const [to, setTo] = useState("English");

  const [src, setSrc] = useState("");

  const [out, setOut] = useState("");

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, from, to);
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final),
    });
  }

  function swap() {
    setFrom(to);
    setTo(from);
    if (out) setSrc(out);
    setOut("");
  }

  const langs = [
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
  ];

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          🌐 Translator
        </h3>

        <div className="flex items-center gap-2">
          <select
            title="selectTranslator"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {langs.map((l) => (
              <option key={`f-${l}`} value={l}>
                {l}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="rounded-full border px-3 py-1 text-sm
                       border-slate-300 bg-white hover:bg-slate-50 text-slate-900
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={swap}
            title="Swap languages"
          >
            ⇄
          </button>

          <select
            title="selectTranslator"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {langs.map((l) => (
              <option key={`t-${l}`} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        className="h-40 w-full resize-none rounded-xl border p-3 text-sm
                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400
                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder="Type or paste text…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={!src.trim() || loading} onClick={run}>
          {loading ? "…" : "Translate"}
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
