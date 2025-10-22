import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { LANGS } from "../../lib/i18n/langs";
import type { LangCode } from "../../lib/i18n/langs";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

import clsx from "clsx";

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
    const prompt = buildPrompt(src, (LANGS as any)[from], (LANGS as any)[to]);
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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          🌐 Translator
        </h3>

        <div className="ml-1 flex justify-between items-center gap-2">
          <select
            title="From language"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={from}
            onChange={(e) => setFrom(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, label]) => (
              <option key={`from-${code}`} value={code}>
                {typeof label === "string" ? label : (label as any).label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={clsx(
              "rounded-full border px-2 py-1 text-xs cursor-pointer",
              "border-slate-200 hover:bg-slate-50 text-slate-700",
              "dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-100"
            )}
            onClick={swap}
            title="Swap languages"
          >
            ⇄
          </button>

          <select
            title="To language"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={to}
            onChange={(e) => setTo(e.target.value as LangCode)}
          >
            {Object.entries(LANGS).map(([code, label]) => (
              <option key={`to-${code}`} value={code}>
                {typeof label === "string" ? label : (label as any).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        className={clsx(
          "h-40 w-full resize-none rounded-xl border p-3 text-sm",
          "bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400",
          "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
        )}
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

      <div
        className={clsx(
          "min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm",
          "bg-white/70 border-slate-200 text-slate-900",
          "dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100"
        )}
      >
        {out || "Output will appear here"}
      </div>

      {provider && (
        <span
          className={clsx(
            "rounded-full border px-3 py-1 text-xs",
            "border-slate-200 bg-slate-100 text-slate-700",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          )}
        >
          via {provider === "openai" ? "openai" : "groq"}
        </span>
      )}
    </Card>
  );
};
