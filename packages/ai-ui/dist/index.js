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

// src/lib/ai/useAI.ts
import { useState } from "react";
function useAI(defaultModel) {
  const {
    client,
    fallback,
    defaultModel: ctxModel,
    provider,
    setProvider
  } = useAIContext();
  const model = defaultModel ?? ctxModel;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

// src/lib/licensing/LicenseContext.tsx
import { createContext as createContext2, useContext as useContext2 } from "react";
var LicenseContext = createContext2({
  key: void 0,
  valid: false,
  status: "invalid",
  payload: null,
  error: "NO_PROVIDER"
});
function useLicense() {
  return useContext2(LicenseContext);
}

// src/lib/licensing/LicenseProvider.tsx
import { useMemo } from "react";

// src/lib/licensing/checkLicense.ts
import nacl from "tweetnacl";
var PUBLIC_KEY_B64URL = "y4hphPusMOvXm5V6SID7LYhLvf2v5etnyAtnoXNoNwM";
function safeBase64UrlToUint8Array(b64url) {
  try {
    const s = (b64url || "").trim();
    if (!s || !/^[A-Za-z0-9_-]+$/.test(s)) return null;
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - b64.length % 4) : "";
    const clean = b64 + pad;
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}
function isValidDateYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function todayYYYYMMDD() {
  const d = /* @__PURE__ */ new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function isExpired(expYYYYMMDD) {
  return expYYYYMMDD < todayYYYYMMDD();
}
function parseLicense(key) {
  if (!key.startsWith("mrszlv1.")) return null;
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  const payloadBytes = safeBase64UrlToUint8Array(parts[1]);
  const sigBytes = safeBase64UrlToUint8Array(parts[2]);
  if (!payloadBytes || !sigBytes) return null;
  if (sigBytes.length !== 64) return null;
  const payloadJson = new TextDecoder().decode(payloadBytes);
  return { payloadJson, sig: sigBytes };
}
function verifyLicense(key) {
  const k = key?.trim();
  if (!k) return { valid: false, payload: null, error: "NO_KEY" };
  if (k.startsWith("mrszlv_demo_")) {
    return {
      valid: true,
      payload: {
        email: "demo",
        plan: "demo",
        exp: "2999-12-31",
        iat: todayYYYYMMDD()
      },
      error: null
    };
  }
  const parsed = parseLicense(k);
  if (!parsed) return { valid: false, payload: null, error: "BAD_FORMAT" };
  let payload;
  try {
    payload = JSON.parse(parsed.payloadJson);
  } catch {
    return { valid: false, payload: null, error: "BAD_PAYLOAD_JSON" };
  }
  if (!payload?.email || !payload?.plan || !payload?.exp || !payload?.iat) {
    return { valid: false, payload: null, error: "MISSING_FIELDS" };
  }
  if (payload.plan !== "pro" && payload.plan !== "demo") {
    return { valid: false, payload: null, error: "BAD_PLAN" };
  }
  if (!isValidDateYYYYMMDD(payload.exp) || !isValidDateYYYYMMDD(payload.iat)) {
    return { valid: false, payload: null, error: "BAD_DATE" };
  }
  if (isExpired(payload.exp)) {
    return { valid: false, payload: null, error: "EXPIRED" };
  }
  const publicKey = safeBase64UrlToUint8Array(PUBLIC_KEY_B64URL);
  if (!publicKey || publicKey.length !== 32) {
    return { valid: false, payload: null, error: "BAD_PUBLIC_KEY" };
  }
  const payloadBytes = new TextEncoder().encode(parsed.payloadJson);
  const ok = nacl.sign.detached.verify(payloadBytes, parsed.sig, publicKey);
  if (!ok) return { valid: false, payload: null, error: "BAD_SIGNATURE" };
  return { valid: true, payload, error: null };
}

// src/lib/licensing/LicenseProvider.tsx
import { jsx } from "react/jsx-runtime";
function LicenseProvider({
  licenseKey,
  children
}) {
  const state = useMemo(() => {
    const res = verifyLicense(licenseKey);
    const valid = res.valid;
    return {
      key: licenseKey?.trim(),
      valid,
      status: valid ? "valid" : "invalid",
      payload: valid ? res.payload : null,
      error: valid ? null : res.error
    };
  }, [licenseKey]);
  return /* @__PURE__ */ jsx(LicenseContext.Provider, { value: state, children });
}

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

// src/components/ui/Button.tsx
import "react";

// ../../node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var clsx_default = clsx;

// src/components/ui/Button.tsx
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
    className: clsx_default(
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
import { jsx as jsx3 } from "react/jsx-runtime";
var Card = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className: clsx_default(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-900",
        className
      ),
      children
    }
  );
};

// src/components/ChatBox/ChatBox.tsx
import { useMemo as useMemo2, useRef, useState as useState2 } from "react";

// src/lib/licensing/withLicenseGuard.tsx
import "react";

// src/components/PaywallCard/PaywallCard.tsx
import "react";
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
var DEFAULT_CTA = "https://t.me/@miroszlavpopovics";
var DEFAULT_PKG = "@mrszlv/ai-ui-components";
var PaywallCard = ({
  title = "Pro component",
  message = "This component is available only with a valid license.",
  reason = 'Wrap your app with <LicenseProvider licenseKey="..." />.',
  ctaHref = DEFAULT_CTA,
  ctaLabel = "Get license",
  npmPackage = DEFAULT_PKG,
  debugReason = null
}) => {
  const handleGetLicense = () => {
    window.open(ctaHref, "_blank", "noopener,noreferrer");
  };
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };
  const installCmd = `npm i ${npmPackage}`;
  return /* @__PURE__ */ jsx4("div", { className: "mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx4("h3", { className: "text-lg font-semibold text-white", children: title }),
    /* @__PURE__ */ jsx4("p", { className: "text-sm text-white/80", children: message }),
    /* @__PURE__ */ jsx4("p", { className: "text-sm text-white/55", children: reason }),
    debugReason ? /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70", children: [
      /* @__PURE__ */ jsx4("span", { className: "font-medium text-white/80", children: "debug:" }),
      " ",
      debugReason
    ] }) : null,
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx4(
        "button",
        {
          type: "button",
          onClick: handleGetLicense,
          className: "rounded-xl bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow hover:bg-indigo-300 active:scale-[0.99]",
          children: ctaLabel
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-white/60", children: [
        /* @__PURE__ */ jsx4("span", { className: "rounded-lg border border-white/10 bg-white/5 px-2 py-1", children: installCmd }),
        /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            onClick: () => handleCopy(installCmd),
            className: "rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10",
            children: "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-white/5 p-4", children: [
      /* @__PURE__ */ jsx4("div", { className: "text-xs font-semibold tracking-wide text-white/70", children: "How to activate" }),
      /* @__PURE__ */ jsxs("ol", { className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-white/70", children: [
        /* @__PURE__ */ jsx4("li", { children: "Buy/get a license key from the link above." }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Wrap your app:",
          /* @__PURE__ */ jsx4("span", { className: "ml-2 rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-white/80", children: '<LicenseProvider licenseKey="..." />' })
        ] }),
        /* @__PURE__ */ jsx4("li", { children: "Reload the app and the component will unlock." })
      ] })
    ] })
  ] }) });
};

// src/lib/licensing/withLicenseGuard.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var LICENSE_URL = "https://t.me/@miroszlavpopovics";
function withLicenseGuard(Wrapped, options) {
  const ComponentWithGuard = (props) => {
    const { status, valid, error } = useLicense();
    if (status === "checking") return null;
    if (!valid) {
      const isDev = typeof import.meta !== "undefined" && import.meta.env?.MODE === "development";
      return /* @__PURE__ */ jsx5(
        PaywallCard,
        {
          title: options?.title,
          message: options?.message ?? "This component is available only with a valid @mrszlv/ai-ui-components license.",
          reason: options?.reason ?? 'Wrap your app with <LicenseProvider licenseKey="..." />.',
          ctaHref: LICENSE_URL,
          ctaLabel: "Get license",
          npmPackage: "@mrszlv/ai-ui-components",
          debugReason: isDev ? error : null
        }
      );
    }
    return /* @__PURE__ */ jsx5(Wrapped, { ...props });
  };
  ComponentWithGuard.displayName = `WithLicenseGuard(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return ComponentWithGuard;
}

// src/components/ChatBox/ChatBox.tsx
import { jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
var ChatBoxInner = () => {
  const { chat, loading, error, provider } = useAI();
  const [messages, setMessages] = useState2([]);
  const [input, setInput] = useState2("");
  const endRef = useRef(null);
  const system = useMemo2(
    () => ({
      role: "system",
      content: [
        "You are a helpful AI assistant.",
        "Keep responses short and practical."
      ].join("\n")
    }),
    []
  );
  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setInput("");
    const reply = await chat([system, ...next]);
    setMessages([...next, { role: "assistant", content: reply }]);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  return /* @__PURE__ */ jsxs2(Card, { className: "max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800", children: [
    /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx6("span", { className: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300", children: "\u{1F4AC}" }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx6("h3", { className: "text-lg font-semibold text-slate-50", children: "ChatBox" }),
        /* @__PURE__ */ jsx6("p", { className: "text-xs text-slate-400", children: "Multi-turn chat with your AI provider." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs2(
      "div",
      {
        className: clsx_default(
          "h-56 md:h-64 w-full overflow-auto rounded-2xl border border-slate-700",
          "bg-slate-950/60 px-3 py-3 text-sm"
        ),
        children: [
          messages.length === 0 && /* @__PURE__ */ jsx6("div", { className: "flex h-full items-center justify-center text-sm text-slate-500", children: "Start the conversation" }),
          messages.map((m, idx) => /* @__PURE__ */ jsx6(
            "div",
            {
              className: clsx_default(
                "mb-2 flex",
                m.role === "user" ? "justify-end" : "justify-start"
              ),
              children: /* @__PURE__ */ jsx6(
                "div",
                {
                  className: clsx_default(
                    "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap break-words",
                    m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-100 border border-slate-700"
                  ),
                  children: m.content
                }
              )
            },
            idx
          )),
          /* @__PURE__ */ jsx6("div", { ref: endRef })
        ]
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: "flex w-full gap-3", children: [
      /* @__PURE__ */ jsx6(
        "input",
        {
          "aria-label": "Type a message",
          className: clsx_default(
            "flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none",
            "placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          ),
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          },
          placeholder: "Ask anything\u2026",
          disabled: loading
        }
      ),
      /* @__PURE__ */ jsx6(
        Button,
        {
          type: "button",
          disabled: loading,
          onClick: () => void handleSend(),
          className: "px-5",
          children: loading ? "Sending..." : "Send"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs2("span", { className: "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx6("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};
var ChatBox = withLicenseGuard(ChatBoxInner, {
  title: "ChatBox (Pro)",
  message: "ChatBox is available only with a valid @mrszlv/ai-ui-components license."
});

// src/components/Summarizer/Summarizer.tsx
import { useState as useState3 } from "react";
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
function buildPrompt(text, language, format) {
  return [
    `You are a professional text summarizer that produces ${format.toLowerCase()} summaries in ${language}.`,
    "Rules:",
    "- Preserve meaning and tone.",
    "- Avoid changing facts.",
    "- Keep formatting consistent (Markdown / line breaks).",
    "",
    "Text:",
    text
  ].join("\n");
}
var SummarizerInner = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [src, setSrc] = useState3("");
  const [out, setOut] = useState3("");
  const [style, setStyle] = useState3("Bulleted");
  const [lang, setLang] = useState3("English");
  async function handleSummarize() {
    const text = src.trim();
    if (!text) return;
    const prompt = buildPrompt(text, lang, style);
    setOut("");
    await streamGenerate(prompt, {
      onToken: (token) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
      }
    });
  }
  return /* @__PURE__ */ jsxs3(Card, { className: "max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800", children: [
    /* @__PURE__ */ jsx7("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx7("span", { className: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300", children: "\u{1F4DD}" }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx7("h3", { className: "text-lg font-semibold text-slate-50", children: "Summarizer" }),
        /* @__PURE__ */ jsx7("p", { className: "text-xs text-slate-400", children: "Turn long texts into clean summaries." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs3("div", { className: "grid gap-4 md:grid-cols-2 md:items-start", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx7("span", { children: "Source text" }),
          /* @__PURE__ */ jsx7("span", { className: "opacity-60", children: src.trim().length ? `${src.trim().length} chars` : "Paste text\u2026" })
        ] }),
        /* @__PURE__ */ jsx7(
          "textarea",
          {
            className: "h-44 md:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40",
            value: src,
            onChange: (e) => setSrc(e.target.value),
            placeholder: "Paste text to summarize..."
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap items-center gap-3 text-xs text-slate-400", children: [
          /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx7("span", { children: "Style:" }),
            /* @__PURE__ */ jsxs3(
              "select",
              {
                title: "select summarizer",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: style,
                onChange: (e) => setStyle(e.target.value),
                children: [
                  /* @__PURE__ */ jsx7("option", { children: "Bulleted" }),
                  /* @__PURE__ */ jsx7("option", { children: "Short paragraph" }),
                  /* @__PURE__ */ jsx7("option", { children: "Very concise" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx7("span", { children: "Language:" }),
            /* @__PURE__ */ jsxs3(
              "select",
              {
                title: "select summarizer",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: lang,
                onChange: (e) => setLang(e.target.value),
                children: [
                  /* @__PURE__ */ jsx7("option", { value: "auto", children: "Auto" }),
                  /* @__PURE__ */ jsx7("option", { value: "English", children: "English" }),
                  /* @__PURE__ */ jsx7("option", { value: "Ukrainian", children: "Ukrainian" }),
                  /* @__PURE__ */ jsx7("option", { value: "Polish", children: "Polish" }),
                  /* @__PURE__ */ jsx7("option", { value: "German", children: "German" }),
                  /* @__PURE__ */ jsx7("option", { value: "Spanish", children: "Spanish" }),
                  /* @__PURE__ */ jsx7("option", { value: "French", children: "French" }),
                  /* @__PURE__ */ jsx7("option", { value: "Italian", children: "Italian" }),
                  /* @__PURE__ */ jsx7("option", { value: "Portuguese", children: "Portuguese" }),
                  /* @__PURE__ */ jsx7("option", { value: "Russian", children: "Russian" }),
                  /* @__PURE__ */ jsx7("option", { value: "Turkish", children: "Turkish" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx7("div", { className: "pt-1", children: /* @__PURE__ */ jsx7(
          Button,
          {
            type: "button",
            disabled: loading,
            onClick: () => void handleSummarize(),
            className: "px-5",
            children: loading ? "Summarizing..." : "Summarize"
          }
        ) }),
        error && /* @__PURE__ */ jsx7("p", { className: "text-xs text-red-400", children: String(error) })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx7("div", { className: "flex items-center justify-between text-xs text-slate-400", children: /* @__PURE__ */ jsx7("span", { children: "Summary" }) }),
        /* @__PURE__ */ jsx7("div", { className: "h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto", children: out ? /* @__PURE__ */ jsx7("div", { className: "whitespace-pre-wrap break-words", children: out }) : /* @__PURE__ */ jsx7("span", { className: "text-slate-500", children: "Summary will appear here\u2026" }) }),
        /* @__PURE__ */ jsxs3("div", { className: "mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs3("span", { children: [
            "Style: ",
            /* @__PURE__ */ jsx7("span", { className: "text-slate-300", children: style })
          ] }),
          /* @__PURE__ */ jsxs3("span", { children: [
            "Language: ",
            /* @__PURE__ */ jsx7("span", { className: "text-slate-300", children: lang })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs3("span", { className: "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx7("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};
var Summarizer = withLicenseGuard(SummarizerInner, {
  title: "Summarizer (Pro)",
  message: "Summarizer is available only with a valid @mrszlv/ai-ui-components license."
});

// src/components/Translator/Translator.tsx
import { useState as useState4 } from "react";
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function buildPrompt2(text, from, to) {
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
var TranslatorInner = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [from, setFrom] = useState4("Ukrainian");
  const [to, setTo] = useState4("English");
  const [src, setSrc] = useState4("");
  const [out, setOut] = useState4("");
  async function handleTranslate() {
    const text = src.trim();
    if (!text) return;
    const prompt = buildPrompt2(text, from, to);
    setOut("");
    await streamGenerate(prompt, {
      onToken: (token) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
      }
    });
  }
  return /* @__PURE__ */ jsxs4(Card, { className: "max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800", children: [
    /* @__PURE__ */ jsx8("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx8("span", { className: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300", children: "\u{1F30D}" }),
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-lg font-semibold text-slate-50", children: "Translator" }),
        /* @__PURE__ */ jsx8("p", { className: "text-xs text-slate-400", children: "Translate text between languages with AI." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs4("div", { className: "grid gap-4 md:grid-cols-2 md:items-start", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx8("span", { children: "Source text" }),
          /* @__PURE__ */ jsx8("span", { className: "opacity-60", children: src.trim().length ? `${src.trim().length} chars` : "Paste text\u2026" })
        ] }),
        /* @__PURE__ */ jsx8(
          "textarea",
          {
            className: "h-44 md:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40",
            value: src,
            onChange: (e) => setSrc(e.target.value),
            placeholder: "Type or paste text to translate..."
          }
        ),
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-wrap items-center gap-3 text-xs text-slate-400", children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx8("span", { children: "From:" }),
            /* @__PURE__ */ jsxs4(
              "select",
              {
                title: "select translator",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: from,
                onChange: (e) => setFrom(e.target.value),
                children: [
                  /* @__PURE__ */ jsx8("option", { value: "English", children: "English" }),
                  /* @__PURE__ */ jsx8("option", { value: "Ukrainian", children: "Ukrainian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Polish", children: "Polish" }),
                  /* @__PURE__ */ jsx8("option", { value: "German", children: "German" }),
                  /* @__PURE__ */ jsx8("option", { value: "Spanish", children: "Spanish" }),
                  /* @__PURE__ */ jsx8("option", { value: "French", children: "French" }),
                  /* @__PURE__ */ jsx8("option", { value: "Italian", children: "Italian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Portuguese", children: "Portuguese" }),
                  /* @__PURE__ */ jsx8("option", { value: "Russian", children: "Russian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Turkish", children: "Turkish" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx8("span", { children: "To:" }),
            /* @__PURE__ */ jsxs4(
              "select",
              {
                title: "select translator",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: to,
                onChange: (e) => setTo(e.target.value),
                children: [
                  /* @__PURE__ */ jsx8("option", { value: "English", children: "English" }),
                  /* @__PURE__ */ jsx8("option", { value: "Ukrainian", children: "Ukrainian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Polish", children: "Polish" }),
                  /* @__PURE__ */ jsx8("option", { value: "German", children: "German" }),
                  /* @__PURE__ */ jsx8("option", { value: "Spanish", children: "Spanish" }),
                  /* @__PURE__ */ jsx8("option", { value: "French", children: "French" }),
                  /* @__PURE__ */ jsx8("option", { value: "Italian", children: "Italian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Portuguese", children: "Portuguese" }),
                  /* @__PURE__ */ jsx8("option", { value: "Russian", children: "Russian" }),
                  /* @__PURE__ */ jsx8("option", { value: "Turkish", children: "Turkish" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx8("div", { className: "pt-1", children: /* @__PURE__ */ jsx8(
          Button,
          {
            type: "button",
            disabled: loading,
            onClick: () => void handleTranslate(),
            className: "px-5",
            children: loading ? "Translating..." : "Translate"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx8("div", { className: "flex items-center justify-between text-xs text-slate-400", children: /* @__PURE__ */ jsx8("span", { children: "Translation" }) }),
        /* @__PURE__ */ jsx8("div", { className: "h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto", children: out ? /* @__PURE__ */ jsx8("div", { className: "whitespace-pre-wrap break-words", children: out }) : /* @__PURE__ */ jsx8("span", { className: "text-slate-500", children: "Translation will appear here\u2026" }) }),
        /* @__PURE__ */ jsxs4("div", { className: "mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs4("span", { children: [
            "From: ",
            /* @__PURE__ */ jsx8("span", { className: "text-slate-300", children: from })
          ] }),
          /* @__PURE__ */ jsxs4("span", { children: [
            "To: ",
            /* @__PURE__ */ jsx8("span", { className: "text-slate-300", children: to })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs4("span", { className: "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx8("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};
var Translator = withLicenseGuard(TranslatorInner, {
  title: "Translator (Pro)",
  message: "Translator is available only with a valid @mrszlv/ai-ui-components license."
});

// src/components/Rewriter/Rewriter.tsx
import { useMemo as useMemo3, useState as useState5 } from "react";
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
function buildPrompt3(text, opts) {
  const toneLine = {
    neutral: "Use a clear, neutral tone.",
    formal: "Use a formal, concise tone suitable for business/academic contexts.",
    casual: "Use a casual, conversational tone.",
    friendly: "Use a warm, friendly tone.",
    professional: "Use a professional, confident tone.",
    confident: "Use a bold, confident tone."
  };
  const lengthLine = {
    shorter: "Make it more concise while preserving meaning.",
    same: "Keep approximately the same length.",
    longer: "Expand with a bit more detail while staying on-topic."
  };
  const creativityLine = {
    low: "Keep wording very close to the original.",
    medium: "Improve clarity and flow while preserving meaning.",
    high: "Be more creative with wording, but keep the same core message."
  };
  const lang = opts.targetLanguage && opts.targetLanguage !== "auto" ? `Rewrite in ${opts.targetLanguage}.` : "Keep the original language.";
  return [
    "You are a professional copy editor.",
    toneLine[opts.tone],
    lengthLine[opts.length],
    creativityLine[opts.creativity],
    lang,
    "",
    "Text:",
    text
  ].join("\n");
}
var RewriterInner = () => {
  const { streamGenerate, loading, error, provider } = useAI();
  const [src, setSrc] = useState5("");
  const [out, setOut] = useState5("");
  const [tone, setTone] = useState5("neutral");
  const [length, setLength] = useState5("same");
  const [creativity, setCreativity] = useState5("medium");
  const [lang, setLang] = useState5("auto");
  const prompt = useMemo3(
    () => buildPrompt3(src, {
      tone,
      length,
      creativity,
      targetLanguage: lang
    }),
    [src, tone, length, creativity, lang]
  );
  async function handleRewrite() {
    const text = src.trim();
    if (!text) return;
    setOut("");
    await streamGenerate(prompt, {
      onToken: (token) => {
        setOut((prev) => prev + token);
      },
      onDone: () => {
      }
    });
  }
  return /* @__PURE__ */ jsxs5(Card, { className: "max-w-5xl mx-auto space-y-5 bg-slate-950/70 border-slate-800", children: [
    /* @__PURE__ */ jsx9("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx9("span", { className: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-300", children: "\u270F\uFE0F" }),
      /* @__PURE__ */ jsxs5("div", { children: [
        /* @__PURE__ */ jsx9("h3", { className: "text-lg font-semibold text-slate-50", children: "Rewriter" }),
        /* @__PURE__ */ jsx9("p", { className: "text-xs text-slate-400", children: "Improve tone, clarity and style of your text." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs5("div", { className: "grid gap-4 md:grid-cols-2 md:items-start", children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
          /* @__PURE__ */ jsx9("span", { children: "Original text" }),
          /* @__PURE__ */ jsx9("span", { className: "opacity-60", children: src.trim().length ? `${src.trim().length} chars` : "Paste text\u2026" })
        ] }),
        /* @__PURE__ */ jsx9(
          "textarea",
          {
            className: "h-44 md:h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40",
            value: src,
            onChange: (e) => setSrc(e.target.value),
            placeholder: "Paste text to rewrite..."
          }
        ),
        /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap items-center gap-3 text-xs text-slate-400", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx9("span", { children: "Tone:" }),
            /* @__PURE__ */ jsxs5(
              "select",
              {
                title: "Select tone",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: tone,
                onChange: (e) => setTone(e.target.value),
                children: [
                  /* @__PURE__ */ jsx9("option", { value: "neutral", children: "Neutral" }),
                  /* @__PURE__ */ jsx9("option", { value: "formal", children: "Formal" }),
                  /* @__PURE__ */ jsx9("option", { value: "casual", children: "Casual" }),
                  /* @__PURE__ */ jsx9("option", { value: "friendly", children: "Friendly" }),
                  /* @__PURE__ */ jsx9("option", { value: "professional", children: "Professional" }),
                  /* @__PURE__ */ jsx9("option", { value: "confident", children: "Confident" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx9("span", { children: "Length:" }),
            /* @__PURE__ */ jsxs5(
              "select",
              {
                title: "Select tone",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: length,
                onChange: (e) => setLength(e.target.value),
                children: [
                  /* @__PURE__ */ jsx9("option", { value: "shorter", children: "Shorter" }),
                  /* @__PURE__ */ jsx9("option", { value: "same", children: "Same" }),
                  /* @__PURE__ */ jsx9("option", { value: "longer", children: "Longer" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx9("span", { children: "Creativity:" }),
            /* @__PURE__ */ jsxs5(
              "select",
              {
                title: "Select tone",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: creativity,
                onChange: (e) => setCreativity(e.target.value),
                children: [
                  /* @__PURE__ */ jsx9("option", { value: "low", children: "Low" }),
                  /* @__PURE__ */ jsx9("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ jsx9("option", { value: "high", children: "High" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx9("span", { children: "Language:" }),
            /* @__PURE__ */ jsxs5(
              "select",
              {
                title: "Select tone",
                className: "rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100",
                value: lang,
                onChange: (e) => setLang(e.target.value),
                children: [
                  /* @__PURE__ */ jsx9("option", { value: "auto", children: "Auto" }),
                  /* @__PURE__ */ jsx9("option", { value: "English", children: "English" }),
                  /* @__PURE__ */ jsx9("option", { value: "Ukrainian", children: "Ukrainian" }),
                  /* @__PURE__ */ jsx9("option", { value: "Polish", children: "Polish" }),
                  /* @__PURE__ */ jsx9("option", { value: "German", children: "German" }),
                  /* @__PURE__ */ jsx9("option", { value: "Spanish", children: "Spanish" }),
                  /* @__PURE__ */ jsx9("option", { value: "French", children: "French" }),
                  /* @__PURE__ */ jsx9("option", { value: "Italian", children: "Italian" }),
                  /* @__PURE__ */ jsx9("option", { value: "Portuguese", children: "Portuguese" }),
                  /* @__PURE__ */ jsx9("option", { value: "Russian", children: "Russian" }),
                  /* @__PURE__ */ jsx9("option", { value: "Turkish", children: "Turkish" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx9("div", { className: "pt-1", children: /* @__PURE__ */ jsx9(
          Button,
          {
            type: "button",
            disabled: loading,
            onClick: () => void handleRewrite(),
            className: "px-5",
            children: loading ? "Rewriting..." : "Rewrite"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx9("div", { className: "flex items-center justify-between text-xs text-slate-400", children: /* @__PURE__ */ jsx9("span", { children: "Result" }) }),
        /* @__PURE__ */ jsx9("div", { className: "h-44 md:h-56 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-100 overflow-auto", children: out ? /* @__PURE__ */ jsx9("div", { className: "whitespace-pre-wrap break-words", children: out }) : /* @__PURE__ */ jsx9("span", { className: "text-slate-500", children: "Rewritten text will appear here\u2026" }) }),
        /* @__PURE__ */ jsxs5("div", { className: "mt-1 text-[11px] text-slate-500 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs5("span", { children: [
            "Tone: ",
            /* @__PURE__ */ jsx9("span", { className: "text-slate-300 capitalize", children: tone })
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "Length:",
            " ",
            /* @__PURE__ */ jsx9("span", { className: "text-slate-300 capitalize", children: length })
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "Creativity:",
            " ",
            /* @__PURE__ */ jsx9("span", { className: "text-slate-300 capitalize", children: creativity })
          ] }),
          /* @__PURE__ */ jsxs5("span", { children: [
            "Language:",
            " ",
            /* @__PURE__ */ jsx9("span", { className: "text-slate-300", children: lang === "auto" ? "Auto" : lang })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-3", children: [
      provider && /* @__PURE__ */ jsxs5("span", { className: "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300", children: [
        "via ",
        provider
      ] }),
      error && /* @__PURE__ */ jsx9("p", { className: "text-xs text-slate-400", children: error })
    ] })
  ] });
};
var Rewriter = withLicenseGuard(RewriterInner, {
  title: "Rewriter (Pro)",
  message: "Rewriter is available only with a valid @mrszlv/ai-ui-components license."
});

// src/lib/ai/AIProvider.tsx
import { useMemo as useMemo4, useState as useState6 } from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
var DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
var DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
function fromVite(name) {
  const env = import.meta.env;
  return env ? env[name] : void 0;
}
function fromNode(name) {
  const env = typeof process !== "undefined" ? process.env : void 0;
  return env ? env[name] : void 0;
}
function fromGlobal(name) {
  const env = globalThis.__AIUI_ENV;
  return env ? env[name] : void 0;
}
function readEnv(name) {
  return fromVite(name) ?? fromNode(name) ?? fromGlobal(name);
}
var AIProvider = ({
  children,
  openaiKey,
  openaiModel,
  groqKey,
  groqModel,
  initialProvider
}) => {
  const [provider, setProvider] = useState6(
    initialProvider ?? readEnv("VITE_AI_PROVIDER") ?? "openai"
  );
  const resolvedOpenAIKey = openaiKey ?? readEnv("VITE_OPENAI_KEY");
  const resolvedGroqKey = groqKey ?? readEnv("VITE_GROQ_KEY");
  const resolvedOpenAIModel = openaiModel ?? readEnv("VITE_OPENAI_MODEL") ?? DEFAULT_OPENAI_MODEL;
  const resolvedGroqModel = groqModel ?? readEnv("VITE_GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;
  const value = useMemo4(() => {
    const openai = resolvedOpenAIKey ? new OpenAIClient(resolvedOpenAIKey) : null;
    const groq = resolvedGroqKey ? new GroqClient(resolvedGroqKey) : null;
    const active = provider === "groq" ? groq ?? openai : openai ?? groq;
    const backup = provider === "groq" ? openai ?? void 0 : groq ?? void 0;
    const defaultModel = provider === "groq" ? resolvedGroqModel : resolvedOpenAIModel;
    if (!active) {
      throw new Error(
        "No AI client configured. Pass keys via props (openaiKey/groqKey) \u0430\u0431\u043E \u0432\u0441\u0442\u0430\u043D\u043E\u0432\u0438 VITE_OPENAI_KEY / VITE_GROQ_KEY."
      );
    }
    return {
      client: active,
      fallback: backup,
      defaultModel,
      provider,
      setProvider
    };
  }, [
    provider,
    resolvedOpenAIKey,
    resolvedGroqKey,
    resolvedOpenAIModel,
    resolvedGroqModel
  ]);
  return /* @__PURE__ */ jsx10(AIContext.Provider, { value, children });
};
var AIProvider_default = AIProvider;

// src/index.ts
var AIUI = {
  ChatBox,
  Summarizer,
  Translator,
  Rewriter,
  AIProvider: AIProvider_default,
  LicenseProvider,
  useAI
};
var index_default = AIUI;
export {
  AIContext,
  AIProvider_default as AIProvider,
  AIProviderBase,
  Button,
  Card,
  ChatBox,
  GroqClient,
  LicenseContext,
  LicenseProvider,
  OpenAIClient,
  Rewriter,
  Summarizer,
  Translator,
  index_default as default,
  readOpenAISSE,
  useAI,
  useAIContext,
  useLicense
};
//# sourceMappingURL=index.js.map