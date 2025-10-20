// src/components/ChatBox/ChatBox.tsx
import React, { useMemo, useRef, useState } from "react";
import type { AIMessage } from "../../lib/ai/types";
import { useAI } from "../../lib/ai/useAI";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const ChatBox: React.FC = () => {
  const { chat, loading, error } = useAI();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const base: AIMessage = {
    role: "system",
    content: "You are a helpful assistant.",
  };
  const visible = useMemo<AIMessage[]>(() => [base, ...messages], [messages]);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input } as AIMessage];
    setInput("");
    // важливо: передати актуальний масив (із новим повідомленням)
    const reply = await chat([base, ...next]);
    setMessages([...next, { role: "assistant", content: reply }]);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Card className="space-y-4">
      <div className="w-full min-h-40 max-h-[28rem] overflow-auto rounded-xl bg-white/60 p-3 text-sm">
        {messages.length === 0 && (
          <div className="text-slate-500">Start the conversation ✨</div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex w-full gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message..."
        />
        <Button disabled={loading} onClick={send}>
          {loading ? "…" : "Send"}
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </Card>
  );
};
