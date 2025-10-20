import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { LANGS } from "../../lib/i18n/langs";
import type { LangCode } from "../../lib/i18n/langs";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

/** Формує перекладацький промпт */
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
  const [from, setFrom] = useState<LangCode>("uk");
  const [to, setTo] = useState<LangCode>("en");
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  const canTranslate = !!src.trim();

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, LANGS[from], LANGS[to]);
    await streamGenerate(prompt, {
      onToken: (t: string) => setOut((prev) => prev + t),
      onDone: (final: string) => setOut(final),
    });
  }

  function swap() {
    setFrom(to);
    setTo(from);
    if (out) setSrc(out);
    setOut("");
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">🌐 Translator</h3>

        <div className="ml-auto flex items-center gap-2">
          {/* FROM */}
          <select
            title="From language"
            className="rounded-xl border px-3 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, label]) => (
              <option key={`from-${code}`} value={code}>
                {label}
              </option>
            ))}
          </select>

          {/* SWAP */}
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50"
            onClick={swap}
            title="Swap languages"
          >
            ⇄
          </button>

          {/* TO */}
          <select
            title="To language"
            className="rounded-xl border px-3 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, label]) => (
              <option key={`to-${code}`} value={code}>
                {label}
              </option>
            ))}
          </select>

          {/* Provider */}
          {provider && (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
              via {provider === "openai" ? "OpenAI" : "Groq"}
            </span>
          )}
        </div>
      </div>

      <textarea
        className="h-40 w-full resize-none rounded-xl border p-3 text-sm"
        placeholder="Type or paste text…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={!canTranslate || loading} onClick={run}>
          {loading ? "…" : "Translate"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="min-h-16 w-full whitespace-pre-wrap rounded-xl border bg-white/60 p-3 text-sm">
        {out || "Output will appear here"}
      </div>
    </Card>
  );
};
