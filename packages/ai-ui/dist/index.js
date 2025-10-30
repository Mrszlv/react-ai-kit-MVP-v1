var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/lib/ai/AIContext.tsx
import React, { createContext, useContext } from "react";
var AIContext = createContext(null);
var AIProviderBase = ({ value, children }) => {
  return React.createElement(AIContext.Provider, { value }, children);
};
function useAIContext() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAIContext must be used inside <AIProvider>");
  return ctx;
}

// src/lib/ai/AIProvider.tsx
import { useMemo, useState } from "react";

// src/lib/ai/utils/sse.ts
async function readOpenAISSE(res, onDelta) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    for (const line of buffer.split("\n")) {
      if (!line) continue;
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") {
          buffer = "";
          break;
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? json.choices?.[0]?.text ?? "";
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
        }
      }
    }
    buffer = buffer.endsWith("\n") ? "" : buffer.split("\n").at(-1) ?? "";
  }
  return full;
}

// src/lib/ai/clients/openai.ts
var OpenAIClient = class {
  constructor(apiKey) {
    __publicField(this, "name", "openai");
    __publicField(this, "apiKey");
    __publicField(this, "baseUrl", "https://api.openai.com/v1");
    this.apiKey = apiKey;
  }
  headers(stream = false) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...stream ? { Accept: "text/event-stream" } : {}
    };
  }
  async generate(opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature ?? 0.7,
        messages: [{ role: "user", content: opts.prompt }]
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }
  async chat(opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature ?? 0.7,
        messages: opts.messages
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }
  async streamGenerate(prompt, handlers, opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: opts?.model ?? "gpt-4o-mini",
        temperature: opts?.temperature ?? 0.7,
        messages: [{ role: "user", content: prompt }],
        stream: true
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const full = await readOpenAISSE(res, (chunk) => handlers.onToken?.(chunk));
    handlers.onDone?.(full);
  }
};

// src/lib/ai/clients/groq.ts
var GroqClient = class {
  constructor(apiKey) {
    __publicField(this, "name", "groq");
    __publicField(this, "apiKey");
    __publicField(this, "baseUrl", "https://api.groq.com/openai/v1");
    this.apiKey = apiKey;
  }
  headers(stream = false) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...stream ? { Accept: "text/event-stream" } : {}
    };
  }
  mapModel(model) {
    return model.startsWith("gpt") || model.startsWith("o1") ? "llama-3.1-8b-instant" : model;
  }
  async generate(opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: this.mapModel(opts.model),
        temperature: opts.temperature ?? 0.7,
        messages: [{ role: "user", content: opts.prompt }]
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }
  async chat(opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(false),
      body: JSON.stringify({
        model: this.mapModel(opts.model),
        temperature: opts.temperature ?? 0.7,
        messages: opts.messages
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  }
  async streamGenerate(prompt, handlers, opts) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({
        model: this.mapModel(opts?.model ?? "llama-3.1-8b-instant"),
        temperature: opts?.temperature ?? 0.7,
        messages: [{ role: "user", content: prompt }],
        stream: true
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const full = await readOpenAISSE(res, (chunk) => handlers.onToken?.(chunk));
    handlers.onDone?.(full);
  }
};

// src/lib/ai/AIProvider.tsx
import { jsx } from "react/jsx-runtime";
var AIProvider = ({ children }) => {
  const [provider, setProvider] = useState("openai");
  const openaiKey = import.meta.env.VITE_OPENAI_KEY;
  const groqKey = import.meta.env.VITE_GROQ_KEY;
  const value = useMemo(() => {
    const openai = openaiKey ? new OpenAIClient(openaiKey) : null;
    const groq = groqKey ? new GroqClient(groqKey) : null;
    const active = provider === "groq" ? groq ?? openai : openai ?? groq;
    const backup = provider === "groq" ? openai ?? void 0 : groq ?? void 0;
    const defaultModel = provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";
    if (!active) {
      throw new Error(
        "No AI client configured. Provide VITE_OPENAI_KEY or VITE_GROQ_KEY."
      );
    }
    return {
      client: active,
      fallback: backup,
      defaultModel,
      provider,
      setProvider
    };
  }, [provider, openaiKey, groqKey]);
  return /* @__PURE__ */ jsx(AIContext.Provider, { value, children });
};
var AIProvider_default = AIProvider;

// src/lib/ai/useAI.ts
import { useState as useState2 } from "react";
function useAI(defaultModel) {
  const {
    client,
    fallback,
    defaultModel: ctxModel,
    provider,
    setProvider
  } = useAIContext();
  const model = defaultModel ?? ctxModel;
  const [loading, setLoading] = useState2(false);
  const [error, setError] = useState2(null);
  async function withFallback(fn) {
    try {
      return await fn(client);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e ?? "Unknown error");
      if (fallback && provider === "openai") {
        const shouldFallback = /429|401|5\d\d|rate|quota|network|fetch/i.test(
          message
        );
        if (shouldFallback) {
          setProvider("groq");
          setError("falling back to groq ai provider");
          return await fn(fallback);
        }
      }
      throw e instanceof Error ? e : new Error(String(e));
    }
  }
  async function chat(messages, temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await withFallback(
        (c) => c.chat({ model, messages, temperature })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
      return "";
    } finally {
      setLoading(false);
    }
  }
  async function generate(prompt, temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      return await withFallback(
        (c) => c.generate({ model, prompt, temperature })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
      return "";
    } finally {
      setLoading(false);
    }
  }
  async function streamGenerate(prompt, handlers, temperature = 0.7) {
    setLoading(true);
    setError(null);
    try {
      await withFallback(
        (c) => c.streamGenerate(prompt, handlers, { model, temperature })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }
  return {
    chat,
    generate,
    streamGenerate,
    loading,
    error,
    provider
  };
}

// src/components/ui/Button.tsx
import "react";
import clsx from "clsx";
import { jsx as jsx2 } from "react/jsx-runtime";
var Button = ({
  className,
  disabled,
  onClick,
  type = "button",
  children
}) => /* @__PURE__ */ jsx2(
  "button",
  {
    type,
    onClick,
    disabled,
    className: clsx(
      "rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
      "bg-indigo-500 text-white hover:bg-indigo-600",
      "dark:bg-indigo-400 dark:hover:bg-indigo-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    ),
    children
  }
);

// src/components/ui/Card.tsx
import "react";
import clsx2 from "clsx";
import { jsx as jsx3 } from "react/jsx-runtime";
var Card = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className: clsx2(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-900",
        className
      ),
      children
    }
  );
};

// src/components/ChatBox/ChatBox.tsx
import { useMemo as useMemo2, useRef, useState as useState3 } from "react";
import clsx3 from "clsx";
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
var ChatBox = () => {
  const { chat, loading, error, provider } = useAI();
  const [messages, setMessages] = useState3([]);
  const [input, setInput] = useState3("");
  const endRef = useRef(null);
  const system = useMemo2(
    () => ({ role: "system", content: "You are a helpful assistant." }),
    []
  );
  async function send() {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setInput("");
    const reply = await chat([system, ...next]);
    setMessages([...next, { role: "assistant", content: reply }]);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "space-y-4", children: [
    /* @__PURE__ */ jsx4("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx4("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "\u{1F4AC} ChatBox" }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: clsx3(
          "w-full min-h-40 max-h-112 overflow-auto rounded-xl border p-3 text-sm",
          "border-slate-200 bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        ),
        children: [
          messages.length === 0 && /* @__PURE__ */ jsx4("div", { className: "text-slate-500 dark:text-slate-400", children: "Start the conversation" }),
          messages.map((m, i) => /* @__PURE__ */ jsx4(
            "div",
            {
              className: clsx3(
                "mb-2 flex",
                m.role === "user" ? "justify-end" : "justify-start"
              ),
              children: /* @__PURE__ */ jsx4(
                "div",
                {
                  className: clsx3(
                    "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap wrap-break-wordbreak-words",
                    m.role === "user" ? "bg-indigo-600 text-white dark:bg-indigo-500" : "bg-white text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  ),
                  children: m.content
                }
              )
            },
            i
          )),
          /* @__PURE__ */ jsx4("div", { ref: endRef })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full gap-2", children: [
      /* @__PURE__ */ jsx4(
        "input",
        {
          "aria-label": "Type a message",
          className: clsx3(
            "flex-1 rounded-xl border px-3 py-2 text-sm outline-none",
            "placeholder:text-slate-400",
            "border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-400"
          ),
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
          placeholder: "Type a message..."
        }
      ),
      /* @__PURE__ */ jsx4(Button, { disabled: loading || input.trim().length === 0, onClick: send, children: loading ? "\u2026" : "Send" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx4("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};

// src/components/Summarizer/Summarizer.tsx
import { useState as useState4 } from "react";
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var Summarizer = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [src, setSrc] = useState4("");
  const [out, setOut] = useState4("");
  const [style, setStyle] = useState4("Bulleted");
  const [lang, setLang] = useState4("English");
  function buildPrompt3(text, language, format) {
    return [
      `You are a professional text summarizer that produces ${format.toLowerCase()} summaries in ${language}.`,
      "Rules:",
      "- Preserve meaning and tone.",
      "- Avoid changing facts.",
      "- Keep formatting consistent (Markdown allowed).",
      "- Use bullet points if requested.",
      "- Output only the summary text.",
      "",
      "Text:",
      text
    ].join("\n");
  }
  async function run() {
    setOut("");
    const prompt = buildPrompt3(src, lang, style);
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final)
    });
  }
  return /* @__PURE__ */ jsxs2(Card, { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx5("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "\u{1F4DD} Summarizer" }),
      /* @__PURE__ */ jsxs2("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ jsx5(
          "select",
          {
            title: "selectSummizer",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: lang,
            onChange: (e) => setLang(e.target.value),
            children: [
              "Ukrainian",
              "English",
              "Polish",
              "German",
              "Spanish",
              "French",
              "Italian",
              "Portuguese",
              "Russian",
              "Turkish"
            ].map((l) => /* @__PURE__ */ jsx5("option", { value: l, children: l }, l))
          }
        ),
        /* @__PURE__ */ jsxs2(
          "select",
          {
            title: "selectSummizer",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: style,
            onChange: (e) => setStyle(e.target.value),
            children: [
              /* @__PURE__ */ jsx5("option", { value: "Bulleted", children: "Bulleted" }),
              /* @__PURE__ */ jsx5("option", { value: "Paragraph", children: "Paragraph" }),
              /* @__PURE__ */ jsx5("option", { value: "Compact", children: "Compact" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx5(
      "textarea",
      {
        className: "h-40 w-full resize-none rounded-xl border p-3 text-sm\r\n                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400\r\n                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        placeholder: "Paste text here\u2026",
        value: src,
        onChange: (e) => setSrc(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx5("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx5(Button, { disabled: loading || !src.trim(), onClick: run, children: loading ? "\u2026" : "Summarize" }) }),
    /* @__PURE__ */ jsx5(
      "div",
      {
        className: "min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm\r\n                      border-slate-200 bg-white/70 text-slate-900\r\n                      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100",
        children: out || "Output will appear here"
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs2("span", { className: "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx5("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};

// src/components/Translator/Translator.tsx
import { useState as useState5 } from "react";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function buildPrompt(text, from, to) {
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
    text
  ].join("\n");
}
var Translator = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [from, setFrom] = useState5("Ukrainian");
  const [to, setTo] = useState5("English");
  const [src, setSrc] = useState5("");
  const [out, setOut] = useState5("");
  async function run() {
    setOut("");
    const prompt = buildPrompt(src, from, to);
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final)
    });
  }
  function swap() {
    setFrom(to);
    setTo(from);
    if (out) setSrc(out);
    setOut("");
  }
  const langs = [
    "Ukrainian",
    "English",
    "Polish",
    "German",
    "Spanish",
    "French",
    "Italian",
    "Portuguese",
    "Russian",
    "Turkish"
  ];
  return /* @__PURE__ */ jsxs3(Card, { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx6("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "\u{1F310} Translator" }),
      /* @__PURE__ */ jsxs3("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ jsx6(
          "select",
          {
            title: "selectTranslator",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: from,
            onChange: (e) => setFrom(e.target.value),
            children: langs.map((l) => /* @__PURE__ */ jsx6("option", { value: l, children: l }, `f-${l}`))
          }
        ),
        /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            className: "rounded-full border px-3 py-1 text-sm\r\n                       border-slate-300 bg-white hover:bg-slate-50 text-slate-900\r\n                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
            onClick: swap,
            title: "Swap languages",
            children: "\u21C4"
          }
        ),
        /* @__PURE__ */ jsx6(
          "select",
          {
            title: "selectTranslator",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: to,
            onChange: (e) => setTo(e.target.value),
            children: langs.map((l) => /* @__PURE__ */ jsx6("option", { value: l, children: l }, `t-${l}`))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx6(
      "textarea",
      {
        className: "h-40 w-full resize-none rounded-xl border p-3 text-sm\r\n                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400\r\n                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        placeholder: "Type or paste text\u2026",
        value: src,
        onChange: (e) => setSrc(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx6("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx6(Button, { disabled: !src.trim() || loading, onClick: run, children: loading ? "\u2026" : "Translate" }) }),
    /* @__PURE__ */ jsx6(
      "div",
      {
        className: "min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm\r\n                      border-slate-200 bg-white/70 text-slate-900\r\n                      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100",
        children: out || "Output will appear here"
      }
    ),
    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs3("span", { className: "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx6("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};

// src/components/Rewriter/Rewriter.tsx
import { useMemo as useMemo3, useState as useState6 } from "react";
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function buildPrompt2(text, opts) {
  const toneLine = {
    neutral: "Use a clear, neutral tone.",
    formal: "Use a formal, concise tone suitable for business/academic contexts.",
    casual: "Use a casual, conversational tone.",
    friendly: "Use a warm, friendly and empathetic tone.",
    professional: "Use a professional tone with precise wording.",
    confident: "Use a confident, assertive tone."
  };
  const lengthLine = {
    shorter: "Make the text shorter while preserving all key meaning.",
    same: "Keep approximately the same length.",
    longer: "Expand the text slightly by adding clarifying details."
  };
  const creativityLine = {
    low: "Be conservative. Avoid creative changes; keep structure close to the original.",
    medium: "Allow moderate rephrasing to improve clarity and flow.",
    high: "Allow creative rephrasing while strictly preserving facts and intent."
  };
  const langLine = !opts.targetLanguage || opts.targetLanguage === "auto" ? "Keep the original language." : `Write the final result in ${opts.targetLanguage}.`;
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
    text
  ].join("\n");
}
var Rewriter = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [tone, setTone] = useState6("neutral");
  const [length, setLength] = useState6("same");
  const [creativity, setCreativity] = useState6("medium");
  const [lang, setLang] = useState6("auto");
  const [src, setSrc] = useState6("");
  const [out, setOut] = useState6("");
  const canRun = useMemo3(() => src.trim().length > 0, [src]);
  async function run() {
    setOut("");
    const prompt = buildPrompt2(src, {
      tone,
      length,
      creativity,
      targetLanguage: lang
    });
    await streamGenerate(prompt, {
      onToken: (t) => setOut((p) => p + t),
      onDone: (final) => setOut(final)
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
    "Turkish"
  ];
  return /* @__PURE__ */ jsxs4(Card, { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs4("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-slate-900 dark:text-slate-100", children: "\u270D\uFE0F Rewriter" }),
      /* @__PURE__ */ jsxs4("div", { className: "ml-auto flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx7(
          "select",
          {
            title: "selectRewriter",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: tone,
            onChange: (e) => setTone(e.target.value),
            children: [
              "neutral",
              "formal",
              "casual",
              "friendly",
              "professional",
              "confident"
            ].map((t) => /* @__PURE__ */ jsx7("option", { value: t, children: t[0].toUpperCase() + t.slice(1) }, t))
          }
        ),
        /* @__PURE__ */ jsxs4(
          "select",
          {
            title: "selectRewriter",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: length,
            onChange: (e) => setLength(e.target.value),
            children: [
              /* @__PURE__ */ jsx7("option", { value: "shorter", children: "Shorter" }),
              /* @__PURE__ */ jsx7("option", { value: "same", children: "Same length" }),
              /* @__PURE__ */ jsx7("option", { value: "longer", children: "Longer" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs4(
          "select",
          {
            title: "selectRewriter",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: creativity,
            onChange: (e) => setCreativity(e.target.value),
            children: [
              /* @__PURE__ */ jsx7("option", { value: "low", children: "Creativity: Low" }),
              /* @__PURE__ */ jsx7("option", { value: "medium", children: "Creativity: Medium" }),
              /* @__PURE__ */ jsx7("option", { value: "high", children: "Creativity: High" })
            ]
          }
        ),
        /* @__PURE__ */ jsx7(
          "select",
          {
            title: "selectRewriter",
            className: "rounded-xl border px-3 py-2 text-sm bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
            value: lang,
            onChange: (e) => setLang(e.target.value),
            children: langs.map((l) => /* @__PURE__ */ jsx7("option", { value: l, children: l }, l))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx7(
      "textarea",
      {
        className: "h-44 w-full resize-none rounded-xl border p-3 text-sm\r\n                   border-slate-300 bg-white text-slate-900 placeholder:text-slate-400\r\n                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        placeholder: "Paste text to rewrite\u2026",
        value: src,
        onChange: (e) => setSrc(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx7("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx7(Button, { disabled: !canRun || loading, onClick: run, children: loading ? "\u2026" : "Rewrite" }) }),
    /* @__PURE__ */ jsx7(
      "div",
      {
        className: "min-h-16 w-full whitespace-pre-wrap rounded-xl border p-3 text-sm\r\n                      border-slate-200 bg-white/70 text-slate-900\r\n                      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100",
        children: out || "Output will appear here"
      }
    ),
    /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs4("span", { className: "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx7("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};

// src/index.ts
var AIUI = { ChatBox, Summarizer, Translator, Rewriter, AIProvider: AIProvider_default, useAI };
var index_default = AIUI;
export {
  AIContext,
  AIProviderBase,
  Button,
  Card,
  ChatBox,
  GroqClient,
  OpenAIClient,
  Rewriter,
  Summarizer,
  Translator,
  index_default as default,
  readOpenAISSE,
  useAI,
  useAIContext
};
//# sourceMappingURL=index.js.map