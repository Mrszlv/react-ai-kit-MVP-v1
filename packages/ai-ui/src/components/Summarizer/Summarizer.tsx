import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { withLicenseGuard } from "../../lib/licensing/withLicenseGuard";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function buildPrompt(text: string, language: string, format: string) {
  return [
    `You are a professional text summarizer that produces ${format.toLowerCase()} summaries in ${language}.`,
    "Rules:",
    "- Preserve meaning and tone.",
    "- Avoid changing facts.",
    "- Keep formatting consistent (Markdown / line breaks).",
    "",
    "Text:",
    text,
  ].join("\n");
}

const SummarizerInner: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  const [style, setStyle] = useState("Bulleted");
  const [lang, setLang] = useState("English");

  async function handleSummarize() {
    const text = src.trim();
    if (!text) return;

    const prompt = buildPrompt(text, lang, style);
    setOut("");

    await streamGenerate(prompt, {
      onToken: (token: string) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
        // no-op
      },
    });
  }

  return (
    <Card className="max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            📝
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Summarizer</h3>
            <p className="text-xs text-slate-400">
              Turn long texts into clean summaries.
            </p>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        {/* left: source */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Source text</span>
            <span className="opacity-60">
              {src.trim().length ? `${src.trim().length} chars` : "Paste text…"}
            </span>
          </div>

          <textarea
            className="h-44 md:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="Paste text to summarize..."
          />

          {/* controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Style:</span>
              <select
                title="select summarizer"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option>Bulleted</option>
                <option>Short paragraph</option>
                <option>Very concise</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Language:</span>
              <select
                title="select summarizer"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
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
              onClick={() => void handleSummarize()}
              className="px-5"
            >
              {loading ? "Summarizing..." : "Summarize"}
            </Button>
          </div>
        </div>

        {/* right: result */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Summary</span>
          </div>

          <div className="h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto">
            {out ? (
              <div className="whitespace-pre-wrap break-words">{out}</div>
            ) : (
              <span className="text-slate-500">Summary will appear here…</span>
            )}
          </div>

          <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3">
            <span>
              Style: <span className="text-slate-300">{style}</span>
            </span>
            <span>
              Language: <span className="text-slate-300">{lang}</span>
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

export const Summarizer = withLicenseGuard(SummarizerInner, {
  title: "Summarizer (Pro)",
  message:
    "Summarizer is available only with a valid @mrszlv/ai-ui-components license.",
});
