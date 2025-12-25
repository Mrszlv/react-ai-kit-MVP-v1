import React, { useMemo, useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { withLicenseGuard } from "../../lib/licensing/withLicenseGuard";

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
    friendly: "Use a warm, friendly tone.",
    professional: "Use a professional, confident tone.",
    confident: "Use a bold, confident tone.",
  };

  const lengthLine: Record<Length, string> = {
    shorter: "Make it more concise while preserving meaning.",
    same: "Keep approximately the same length.",
    longer: "Expand with a bit more detail while staying on-topic.",
  };

  const creativityLine: Record<Creativity, string> = {
    low: "Keep wording very close to the original.",
    medium: "Improve clarity and flow while preserving meaning.",
    high: "Be more creative with wording, but keep the same core message.",
  };

  const lang =
    opts.targetLanguage && opts.targetLanguage !== "auto"
      ? `Rewrite in ${opts.targetLanguage}.`
      : "Keep the original language.";

  return [
    "You are a professional copy editor.",
    toneLine[opts.tone],
    lengthLine[opts.length],
    creativityLine[opts.creativity],
    lang,
    "",
    "Text:",
    text,
  ].join("\n");
}

const RewriterInner: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  const [tone, setTone] = useState<Tone>("neutral");
  const [length, setLength] = useState<Length>("same");
  const [creativity, setCreativity] = useState<Creativity>("medium");
  const [lang, setLang] = useState<string | "auto">("auto");

  const prompt = useMemo(
    () =>
      buildPrompt(src, {
        tone,
        length,
        creativity,
        targetLanguage: lang,
      }),
    [src, tone, length, creativity, lang]
  );

  async function handleRewrite() {
    const text = src.trim();
    if (!text) return;

    setOut("");

    await streamGenerate(prompt, {
      onToken: (token: string) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
        // nothing extra for now
      },
    });
  }

  return (
    <Card className="max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
            ✏️
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Rewriter</h3>
            <p className="text-xs text-slate-400">
              Improve tone, clarity and style of your text.
            </p>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        {/* left: source */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Original text</span>
            <span className="opacity-60">
              {src.trim().length ? `${src.trim().length} chars` : "Paste text…"}
            </span>
          </div>

          <textarea
            className="h-44 md:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="Paste text to rewrite..."
          />

          {/* controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Tone:</span>
              <select
                title="Select tone"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
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
            </div>

            <div className="flex items-center gap-2">
              <span>Length:</span>
              <select
                title="Select tone"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={length}
                onChange={(e) => setLength(e.target.value as Length)}
              >
                <option value="shorter">Shorter</option>
                <option value="same">Same</option>
                <option value="longer">Longer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Creativity:</span>
              <select
                title="Select tone"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={creativity}
                onChange={(e) => setCreativity(e.target.value as Creativity)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Language:</span>
              <select
                title="Select tone"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={lang}
                onChange={(e) => setLang(e.target.value as string | "auto")}
              >
                <option value="auto">Auto</option>
                <option value="English">English</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="Polish">Polish</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Turkish">Turkish</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              disabled={loading}
              onClick={() => void handleRewrite()}
              className="px-5"
            >
              {loading ? "Rewriting..." : "Rewrite"}
            </Button>
          </div>
        </div>

        {/* right: result */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Result</span>
          </div>

          <div className="h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto">
            {out ? (
              <div className="whitespace-pre-wrap break-words">{out}</div>
            ) : (
              <span className="text-slate-500">
                Rewritten text will appear here…
              </span>
            )}
          </div>

          {/* показуємо поточні налаштування під результатом */}
          <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3">
            <span>
              Tone: <span className="text-slate-300 capitalize">{tone}</span>
            </span>
            <span>
              Length:{" "}
              <span className="text-slate-300 capitalize">{length}</span>
            </span>
            <span>
              Creativity:{" "}
              <span className="text-slate-300 capitalize">{creativity}</span>
            </span>
            <span>
              Language:{" "}
              <span className="text-slate-300">
                {lang === "auto" ? "Auto" : lang}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {provider && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            via {provider}
          </span>
        )}
        {error && <p className="text-xs text-slate-400">{error}</p>}
      </div>
    </Card>
  );
};

export const Rewriter = withLicenseGuard(RewriterInner, {
  title: "Rewriter (Pro)",
  message:
    "Rewriter is available only with a valid @mrszlv/ai-ui-components license.",
});
