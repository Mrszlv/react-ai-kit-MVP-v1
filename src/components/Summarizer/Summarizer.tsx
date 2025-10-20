// src/components/Summarizer/Summarizer.tsx
import React, { useState } from "react";
import { useAI } from "../../lib/ai/useAI";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const Summarizer: React.FC = () => {
  const { generate, loading, error } = useAI();
  const [text, setText] = useState("");
  const [out, setOut] = useState("");

  async function run() {
    const res = await generate(`Summarize the following text:\n\n${text}`);
    setOut(res);
  }

  return (
    <Card className="space-y-4">
      <textarea
        className="h-40 w-full resize-y rounded-xl border p-3 text-sm"
        placeholder="Paste text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end">
        <Button disabled={loading || !text.trim()} onClick={run}>
          {loading ? "…" : "Summarize"}
        </Button>
      </div>
      <div className="min-h-16 w-full whitespace-pre-wrap rounded-xl border bg-white/60 p-3 text-sm">
        {out || "Output will appear here"}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </Card>
  );
};
