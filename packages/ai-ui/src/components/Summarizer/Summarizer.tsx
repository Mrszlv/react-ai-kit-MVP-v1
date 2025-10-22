import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { LANGS } from "../../lib/i18n/langs";
import type { LangCode } from "../../lib/i18n/langs";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

import clsx from "clsx";

function langLabel(code: LangCode): string {
  const v = (
    LANGS as unknown as Record<
      LangCode,
      string | { label?: string } | undefined
    >
  )[code];
  return typeof v === "string" ? v : v?.label ?? String(code);
}

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
    const text = src.trim();
    if (!text) return;
    setOut("");

    const prompt = buildPrompt(text, langLabel(lang), style);

    await streamGenerate(prompt, {
      onToken: (t) => setOut((prev) => prev + t),
      onDone: (final) => setOut(final),
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          📝 Summarizer
        </h3>

        <div className="ml-1 flex flex-wrap items-center gap-2">
          <select
            title="Language"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
          >
            {Object.keys(LANGS).map((code) => (
              <option key={code} value={code}>
                {langLabel(code as LangCode)}
              </option>
            ))}
          </select>

          <select
            title="Summary style"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
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
        className={clsx(
          "h-40 w-full resize-none rounded-xl border p-3 text-sm outline-none",
          "bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400",
          "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
        )}
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
            "border-slate-200 bg-slate-100 text-slate-700",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
            "rounded-full border px-3 py-1 text-xs"
          )}
        >
          via {provider === "openai" ? "openai" : "groq"}
        </span>
      )}
    </Card>
  );
};
