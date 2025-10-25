import React, { useMemo, useState } from "react";
import { useAI } from "../../lib/ai/useAI";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Tone =
  | "neutral"
  | "formal"
  | "casual"
  | "friendly"
  | "professional"
  | "confident";
type Length = "shorter" | "same" | "longer";
type Creativity = "low" | "medium" | "high";

function buildPrompt(
  text: string,
  opts: {
    tone: Tone;
    length: Length;
    creativity: Creativity;
    targetLanguage?: string | "auto";
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
    !opts.targetLanguage || opts.targetLanguage === "auto"
      ? "Keep the original language."
      : `Write the final result in ${opts.targetLanguage}.`;

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

export const Rewriter: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [tone, setTone] = useState<Tone>("neutral");
  const [length, setLength] = useState<Length>("same");
  const [creativity, setCreativity] = useState<Creativity>("medium");
  const [lang, setLang] = useState<string | "auto">("auto");
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  const canRun = useMemo(() => src.trim().length > 0, [src]);

  async function run() {
    setOut("");
    const prompt = buildPrompt(src, {
      tone,
      length,
      creativity,
      targetLanguage: lang,
    });
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final),
    });
  }

  const langs = [
    "auto",
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
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          ✍️ Rewriter
        </h3>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            title="selectRewriter"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            {[
              "neutral",
              "formal",
              "casual",
              "friendly",
              "professional",
              "confident",
            ].map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <select
            title="selectRewriter"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
          >
            <option value="shorter">Shorter</option>
            <option value="same">Same length</option>
            <option value="longer">Longer</option>
          </select>

          <select
            title="selectRewriter"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={creativity}
            onChange={(e) => setCreativity(e.target.value as Creativity)}
          >
            <option value="low">Creativity: Low</option>
            <option value="medium">Creativity: Medium</option>
            <option value="high">Creativity: High</option>
          </select>

          <select
            title="selectRewriter"
            className="rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {langs.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        className="h-44 w-full resize-none rounded-xl border p-3 text-sm
                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400
                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder="Paste text to rewrite…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button disabled={!canRun || loading} onClick={run}>
          {loading ? "…" : "Rewrite"}
        </Button>
      </div>

      <div
        className="min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm
                      border-slate-200 bg-white/70 text-slate-900
                      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
      >
        {out || "Output will appear here"}
      </div>

      {provider && (
        <span className="mr-2.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          via {provider}
        </span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </Card>
  );
};
