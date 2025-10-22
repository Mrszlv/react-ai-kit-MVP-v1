import React, { useMemo, useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { LANGS } from "../../lib/i18n/langs";
import type { LangCode } from "../../lib/i18n/langs";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import clsx from "clsx";

type Tone =
  | "neutral"
  | "formal"
  | "casual"
  | "friendly"
  | "professional"
  | "confident";
type Length = "shorter" | "same" | "longer";
type Creativity = "low" | "medium" | "high";

// Підказки для моделі
function buildPrompt(
  text: string,
  opts: {
    tone: Tone;
    length: Length;
    creativity: Creativity;
    targetLang?: LangCode | "auto"; // auto = залишити мову оригіналу
  }
) {
  const toneLine: Record<Tone, string> = {
    neutral: "Use a clear, neutral tone.",
    formal:
      "Use a formal, concise tone suitable for business/academic contexts.",
    casual: "Use a casual, conversational tone.",
    friendly: "Use a warm, friendly and empathetic tone.",
    professional: "Use a professional tone with precise wording.",
    confident: "Use a confident, assertive tone.",
  };

  const lengthLine: Record<Length, string> = {
    shorter: "Make the text shorter while preserving all key meaning.",
    same: "Keep approximately the same length.",
    longer: "Expand the text slightly by adding clarifying details.",
  };

  const creativityLine: Record<Creativity, string> = {
    low: "Be conservative. Avoid creative changes; keep structure close to the original.",
    medium: "Allow moderate rephrasing to improve clarity and flow.",
    high: "Allow creative rephrasing while strictly preserving facts and intent.",
  };

  const langLine =
    !opts.targetLang || opts.targetLang === "auto"
      ? "Keep the original language."
      : `Write the final result in ${LANGS[opts.targetLang]}.`;

  return [
    "You are an expert text rewriter.",
    toneLine[opts.tone],
    lengthLine[opts.length],
    creativityLine[opts.creativity],
    langLine,
    "",
    "Hard rules:",
    "- Preserve meaning, facts, numbers, units, named entities.",
    "- Preserve Markdown structure (headers, lists, tables).",
    "- Do NOT translate or alter code blocks, inline code, URLs, or file paths.",
    "- Keep emojis and punctuation where appropriate.",
    "- Maintain paragraph and line break structure unless clarity requires change.",
    "",
    "Rewrite the following text accordingly:",
    text,
  ].join("\n");
}

export const Rewriter: React.FC<{
  defaultTone?: Tone;
  defaultLength?: Length;
  defaultCreativity?: Creativity;
  defaultTargetLang?: LangCode | "auto";
  title?: string;
  placeholder?: string;
  buttonLabel?: string;
}> = ({
  defaultTone = "neutral",
  defaultLength = "same",
  defaultCreativity = "medium",
  defaultTargetLang = "auto",
  title = "Rewriter",
  placeholder = "Paste text to rewrite…",
  buttonLabel = "Rewrite",
}) => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [tone, setTone] = useState<Tone>(defaultTone);
  const [length, setLength] = useState<Length>(defaultLength);
  const [creativity, setCreativity] = useState<Creativity>(defaultCreativity);
  const [lang, setLang] = useState<LangCode | "auto">(defaultTargetLang);
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  const canRun = src.trim().length > 0;

  const langOptions = useMemo(
    () =>
      [{ code: "auto", label: "Auto (keep original)" } as const].concat(
        Object.entries(LANGS).map(([code, label]) => ({ code, label })) as any
      ),
    []
  );

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, {
      tone,
      length,
      creativity,
      targetLang: lang,
    });

    await streamGenerate(prompt, {
      onToken: (t) => setOut((prev) => prev + t),
      onDone: (final) => setOut(final),
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          ✍️ {title}
        </h3>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            title="Tone"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="confident">Confident</option>
          </select>

          <select
            title="Length"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
          >
            <option value="shorter">Shorter</option>
            <option value="same">Same length</option>
            <option value="longer">Longer</option>
          </select>

          <select
            title="Creativity"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={creativity}
            onChange={(e) => setCreativity(e.target.value as Creativity)}
          >
            <option value="low">Creativity: Low</option>
            <option value="medium">Creativity: Medium</option>
            <option value="high">Creativity: High</option>
          </select>

          <select
            title="Target language"
            className={clsx(
              "rounded-xl border px-2 py-1 text-sm cursor-pointer",
              "bg-white/90 border-slate-200 text-slate-900",
              "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100"
            )}
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode | "auto")}
          >
            {langOptions.map((o: any) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        className={clsx(
          "h-44 w-full resize-none rounded-xl border p-3 text-sm outline-none",
          "bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400",
          "dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
        )}
        placeholder={placeholder}
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={!canRun || loading} onClick={run}>
          {loading ? "…" : buttonLabel}
        </Button>
        {error && <span className="text-xs text-red-600">{error}</span>}
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
