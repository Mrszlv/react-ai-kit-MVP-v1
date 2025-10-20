import React, { useState } from "react";
import { useAI } from "../../lib/ai/useAI";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

function buildPrompt(text: string, target: string) {
  return [
    "You are a professional translator.",
    "Preserve the original formatting and Markdown:",
    "- Do not translate code blocks, inline code, URLs, or markdown links.",
    "- Keep lists, headers, bold/italic as in source.",
    "- Maintain emojis and punctuation.",
    `Translate to ${target}.`,
    "",
    text,
  ].join("\n");
}

export const Translator: React.FC = () => {
  const { generateStream, loading, error, provider } = useAI();
  const [src, setSrc] = useState("");
  const [to, setTo] = useState("uk");
  const [out, setOut] = useState("");

  async function run() {
    setOut("");
    await generateStream(buildPrompt(src, to), (t) =>
      setOut((prev) => prev + t)
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          title="select"
          className="rounded-xl border px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          <option value="uk">Ukrainian</option>
          <option value="en">English</option>
          <option value="pl">Polish</option>
          <option value="de">German</option>
        </select>
        <Button
          className="ml-auto"
          disabled={loading || !src.trim()}
          onClick={run}
        >
          {loading ? "…" : "Translate"}
        </Button>
        {provider && (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700">
            via {provider === "openai" ? "OpenAI" : "Groq"}
          </span>
        )}
      </div>

      <textarea
        className="h-40 w-full resize-y rounded-xl border p-3 text-sm"
        placeholder="Type or paste text…"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />

      <div className="min-h-16 w-full whitespace-pre-wrap rounded-xl border bg-white/60 p-3 text-sm">
        {out || "Output will appear here"}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </Card>
  );
};
