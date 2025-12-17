import React, { useMemo, useRef, useState } from "react";
import clsx from "clsx";

import type { AIMessage } from "../../lib/ai/types";
import { useAI } from "../../lib/ai/useAI";
import { withLicenseGuard } from "../../lib/licensing/withLicenseGuard";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const ChatBoxInner: React.FC = () => {
  const { chat, loading, error, provider } = useAI();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");

  const endRef = useRef<HTMLDivElement>(null);

  const system = useMemo<AIMessage>(
    () => ({
      role: "system",
      content: [
        "You are a helpful AI assistant.",
        "Keep responses short and practical.",
      ].join("\n"),
    }),
    []
  );

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const next = [...messages, { role: "user", content: text } as AIMessage];
    setInput("");

    const reply = await chat([system, ...next]);
    setMessages([...next, { role: "assistant", content: reply }]);

    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Card className="max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
            💬
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-50">ChatBox</h3>
            <p className="text-xs text-slate-400">
              Multi-turn chat with your AI provider.
            </p>
          </div>
        </div>

        {/* {provider && (
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
            {provider}
          </span>
        )} */}
      </div>

      {/* messages area */}
      <div
        className={clsx(
          "h-56 md:h-64 w-full overflow-auto rounded-2xl border border-slate-700",
          "bg-slate-950/60 px-3 py-3 text-sm"
        )}
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Start the conversation
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={clsx(
              "mb-2 flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap break-words",
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-100 border border-slate-700"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* input row */}
      <div className="flex w-full gap-3">
        <input
          aria-label="Type a message"
          className={clsx(
            "flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none",
            "placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ask anything…"
          disabled={loading}
        />

        <Button
          type="button"
          disabled={loading}
          onClick={() => void handleSend()}
          className="px-5"
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>

      {/* footer meta */}
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

export const ChatBox = withLicenseGuard(ChatBoxInner, {
  title: "ChatBox (Pro)",
  message:
    "ChatBox is available only with a valid @mrszlv/ai-ui-components license.",
});
