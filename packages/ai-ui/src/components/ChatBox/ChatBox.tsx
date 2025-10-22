import React, { useMemo, useRef, useState } from "react";

import type { AIMessage } from "../../lib/ai/types";
import { useAI } from "../../lib/ai/useAI";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

import clsx from "clsx";

export const ChatBox: React.FC = () => {
  const { chat, loading, error, provider } = useAI();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const base = useMemo<AIMessage>(
    () => ({ role: "system", content: "You are a helpful assistant." }),
    []
  );

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input } as AIMessage];
    setInput("");

    const reply = await chat([base, ...next]);
    setMessages([...next, { role: "assistant", content: reply }]);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Card className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          💬 ChatBox
        </h3>
      </div>

      {/* Стрічка чату */}
      <div
        className="
          w-full min-h-40 max-h-112 overflow-auto rounded-xl border
          bg-slate-50/80 p-3 text-sm
          border-slate-200
          dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100
        "
      >
        {messages.length === 0 && (
          <div className="text-slate-500 dark:text-slate-400">
            Start the conversation
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={[
                "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
                m.role === "user"
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "bg-white text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
              ].join(" ")}
            >
              {m.content}
            </div>
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* Ввід + кнопка */}
      <div className="flex w-full gap-2">
        <input
          aria-label="Type a message"
          className="
            min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none
            placeholder:text-slate-400
            border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500
            dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500
            dark:focus:ring-indigo-400
          "
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
        <Button disabled={loading || input.trim().length === 0} onClick={send}>
          {loading ? "…" : "Send"}
        </Button>
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

      {error && <p className="text-xs text-red-600">{error}</p>}
    </Card>
  );
};
