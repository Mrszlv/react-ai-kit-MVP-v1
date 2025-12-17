import React, { useState } from "react";

import { useAI } from "../../lib/ai/useAI";
import { withLicenseGuard } from "../../lib/licensing/withLicenseGuard";

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

const TranslatorInner: React.FC = () => {
  const { streamGenerate, loading, error, provider } = useAI();

  const [from, setFrom] = useState("Ukrainian");
  const [to, setTo] = useState("English");

  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");

  async function handleTranslate() {
    const text = src.trim();
    if (!text) return;

    const prompt = buildPrompt(text, from, to);
    setOut("");

    await streamGenerate(prompt, {
      onToken: (token: string) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
        // no-op for now
      },
    });
  }

  return (
    <Card className="max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
            🌍
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Translator</h3>
            <p className="text-xs text-slate-400">
              Translate text between languages with AI.
            </p>
          </div>
        </div>

        {/* {provider && (
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
            {provider}
          </span>
        )} */}
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
            placeholder="Type or paste text to translate..."
          />

          {/* controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>From:</span>
              <select
                title="select translator"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
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

            <div className="flex items-center gap-2">
              <span>To:</span>
              <select
                title="select translator"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
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
              onClick={() => void handleTranslate()}
              className="px-5"
            >
              {loading ? "Translating..." : "Translate"}
            </Button>
          </div>

          {/* {error && <p className="text-xs text-red-400">{String(error)}</p>} */}
        </div>

        {/* right: result */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Translation</span>
          </div>

          <div className="h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto">
            {out ? (
              <div className="whitespace-pre-wrap break-words">{out}</div>
            ) : (
              <span className="text-slate-500">
                Translation will appear here…
              </span>
            )}
          </div>

          <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3">
            <span>
              From: <span className="text-slate-300">{from}</span>
            </span>
            <span>
              To: <span className="text-slate-300">{to}</span>
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

export const Translator = withLicenseGuard(TranslatorInner, {
  title: "Translator (Pro)",
  message:
    "Translator is available only with a valid @mrszlv/ai-ui-components license.",
});
