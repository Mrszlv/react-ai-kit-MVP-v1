# 🧠 React AI UI Components

**`@mrszlv/ai-ui-components`** — a modular, production-ready set of React components and hooks for building AI-powered interfaces.
It includes ready-to-use chat, summarizer, translator, and text rewriter components, powered by **OpenAI** and **Groq** APIs, with full TypeScript support and Tailwind-based styling.

---

[![npm version](https://img.shields.io/npm/v/@mrszlv/ai-ui-components.svg?color=gold&style=flat-square)](https://www.npmjs.com/package/@mrszlv/ai-ui-components)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/mrszlv/react-ai-kit-MVP-v1/build.yml?style=flat-square)](https://github.com/mrszlv/react-ai-kit-MVP-v1)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🚀 Installation

### Using npm

```bash
npm install @mrszlv/ai-ui-components
```

### Using pnpm

<pre class="overflow-visible!" data-start="1244" data-end="1289"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>pnpm add @mrszlv/ai-ui-components</span></span></code></div></div></pre>

## ⚙️ Quick Setup

### Option 1 — Named imports (recommended)

```tsx
import {
  AIProvider,
  ChatBox,
  Translator,
  Summarizer,
  Rewriter,
} from "@mrszlv/ai-ui-components";
import "@mrszlv/ai-ui-components/dist/index.css";

function App() {
  return (
    <AIProvider>
      <main>
        <ChatBox />
        <Summarizer />
        <Translator />
        <Rewriter />
      </main>
    </AIProvider>
  );
}

export default App;
```

import AIUI from "@mrszlv/ai-ui-components";
import "@mrszlv/ai-ui-components/dist/index.css";

function App() {
const { ChatBox, Translator, Summarizer, Rewriter, AIProvider } = AIUI;

return (
`<AIProvider>`
`<ChatBox />`
`<Summarizer />`
`<Translator />`
`<Rewriter />`
`</AIProvider>`
);
}

export default App;

## 🧩 Components

| Component       | Description                                   |
| --------------- | --------------------------------------------- |
| `ChatBox`       | Full AI chat interface with message streaming |
| `Summarizer`    | Summarizes long articles or paragraphs        |
| `Translator`    | Translates between any languages              |
| `Rewriter`      | Rephrases text while preserving meaning       |
| `Button`,`Card` | Utility UI elements for layout and actions    |

## 🧠 Hook: `useAI(model?: string)`

Provides direct programmatic access to AI features.

` <pre class="overflow-visible!" data-start="2565" data-end="2948"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary">``<div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2">``<div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div>``</div></div>``<div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx">``<span><span> `import `<span>` { useAI } `<span>`from `<span><span>`"@mrszlv/ai-ui-components"`<span>`;

`<span>`function `<span><span>`Generator `<span>`(`<span><span>`) {
`<span>`const `<span>` { generate, chat, loading, error } = `<span>`useAI `<span>`(`<span>`"gpt-4o-mini"`<span>`);

`<span>`const `<span><span>`handleClick `<span>` = `<span>`async `<span>` (`<span><span>`) => {
`<span>`const `<span>` text = `<span>`await `<span><span>`generate `<span>`(`<span>`"Explain how React hooks work"`<span>`);
`<span>`console `<span>`.`<span>`log `<span>`(text);
};

`<span>`return `<span>` (
`<span><span class="language-xml">`<button `<span><span>`onClick `<span>`=`<span>`{handleClick}`<span><span>`disabled `<span>`=`<span>`{loading}`<span>`>
Generate
`<span>`</button `<span>`>
);
}` </code></div>``</div></pre> `

## 🌐 Environment Variables

Create a `.env.local` file in your project root and provide your API keys:

<pre class="overflow-visible!" data-start="3060" data-end="3139"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>VITE_OPENAI_KEY=your_openai_api_key
VITE_GROQ_KEY=your_groq_api_key
</span></span></code></div></div></pre>

The `AIProvider` automatically switches between **OpenAI** and **Groq** depending on API availability.

## 🧱 Package Structure

` <pre class="overflow-visible!" data-start="3275" data-end="3626"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary">``<div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2">``<div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div>``</div></div>``<div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash">``<span><span> `packages/ai-ui/
├─ src/
│ ├─ components/
│ │ ├─ ChatBox/
│ │ ├─ Translator/
│ │ ├─ Summarizer/
│ │ ├─ Rewriter/
│ │ └─ ui/
│ ├─ lib/
│ │ ├─ ai/
│ │ │ ├─ AIProvider.tsx
│ │ │ ├─ useAI.ts
│ │ │ ├─ AIContext.tsx
│ │ │ └─ clients/
│ ├─ index.ts
│ └─ tailwind.css
└─ dist/` </code></div>``</div></pre> `

## ⚡ Build & Development

### Build the package

<pre class="overflow-visible!" data-start="3681" data-end="3728"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run -w packages/ai-ui build:all</span></span></code></div></div></pre>

### Clean build

<pre class="overflow-visible!" data-start="3746" data-end="3820"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div 
class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>rm</span><span> -rf packages/ai-ui/dist
npm run -w packages/ai-ui build:all</span></span></code></div></div></pre>

### Test locally

<pre class="overflow-visible!" data-start="3839" data-end="3912"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>rm</span><span> -rf node_modules package-lock.json
npm install
npm run dev</span></span></code></div></div></pre>

## 🧾 Public Exports

<pre class="overflow-visible!" data-start="3941" data-end="4086"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>export</span><span> {
  </span><span>AIProvider</span><span>,
  useAI,
  </span><span>ChatBox</span><span>,
  </span><span>Summarizer</span><span>,
  </span><span>Translator</span><span>,
  </span><span>Rewriter</span><span>,
  </span><span>Button</span><span>,
  </span><span>Card</span><span>,
} </span><span>from</span><span></span><span>"@mrszlv/ai-ui-components"</span><span>;</span></span></code></div></div></pre>

Or via default object:

<pre class="overflow-visible!" data-start="4112" data-end="4216"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span></span><span>AIUI</span><span></span><span>from</span><span></span><span>"@mrszlv/ai-ui-components"</span><span>;
</span><span>const</span><span> { </span><span>AIProvider</span><span>, </span><span>ChatBox</span><span>, </span><span>Translator</span><span> } = </span><span>AIUI</span><span>;</span></span></code></div></div></pre>

## 🎨 TailwindCSS Integration

This library comes with a compiled `index.css` generated from Tailwind.

If your project already uses Tailwind, simply include the package’s CSS:

<pre class="overflow-visible!" data-start="4402" data-end="4462"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>import</span><span></span><span>"@mrszlv/ai-ui-components/dist/index.css"</span><span>;</span></span></code></div></div></pre>

## 🧩 Tech Stack

- ⚛️ React 19
- 💨 TailwindCSS 3 / 4 compatible
- 🧩 TypeScript 5
- ⚙️ Vite build setup
- 🧠 OpenAI & Groq API ready
- 🧹 ESLint + Prettier configured
- 🧪 Fully typed & modular

## 📘 API Reference

| Function                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| `generate(prompt, temperature?)`                 | Returns AI-generated text       |
| `chat(messages, temperature?)`                   | Runs conversational context     |
| `streamGenerate(prompt, handlers, temperature?)` | Streams output token-by-token   |
| `readOpenAISSE(response, onDelta)`               | Handles SSE streams from OpenAI |

## 📦 Versioning & Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.

All version updates are automatically tracked in `CHANGELOG.md`.

## 🧑‍💻 Development Workflow

<pre class="overflow-visible!" data-start="5279" data-end="5476"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Install dependencies</span><span>
npm install

</span><span># Watch mode</span><span>
npm run -w packages/ai-ui dev

</span><span># Lint & format</span><span>
npm run lint

</span><span># Commit with Husky hooks</span><span>
git add .
git commit -m </span><span>"feat: add new component"</span></span></code></div></div></pre>

## 🧾 License

This project is licensed under the **MIT License** — see the [LICENSE]() file for details.

<pre class="overflow-visible!" data-start="5599" data-end="5664"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>MIT</span><span> © </span><span>2025</span><span></span><span>[Miroslav Popovich]</span><span>(</span><span>https</span><span>:</span><span>//github.com/mrszlv)</span></span></code></div></div></pre>

## 🔗 Repository

👉 [github.com/mrszlv/react-ai-kit-MVP-v1](https://github.com/mrszlv/react-ai-kit-MVP-v1)

## 💬 Support / Feedback

If you encounter any issues or want to suggest a new feature,

please open an issue on [GitHub Issues](https://github.com/mrszlv/react-ai-kit-MVP-v1/issues).

### ✨ Coming Soon

- 🧩 Theme tokens (light/dark)
- 🧠 Custom model switching via UI
- 💬 Conversation memory & message history
- 🌐 Multi-language interface support

Built with ❤️ by **[Miroslav Popovich](https://github.com/mrszlv)**

for modern AI-driven UI experiences.
