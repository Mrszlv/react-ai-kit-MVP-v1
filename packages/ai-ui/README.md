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

```bash
pnpm add @mrszlv/ai-ui-components
```

## 🎨 Styling

This library uses TailwindCSS utility classes.
Your app must have Tailwind enabled to render styles correctly.

If you’re using TailwindCSS v4, install the new plugin for Vite:

```bash
npm i -D @tailwindcss/vite
```

Then add it to your vite.config.ts:

```ts
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
});
```

## Import the built-in CSS

The library includes a pre-compiled stylesheet (dist/index.css).

```tsx
import "@mrszlv/ai-ui-components/style.css";
```

You can place this import in your main.tsx or App.tsx.

## ⚙️ Environment Setup

Create a .env.local file in your project root and provide your API keys:

```bash
VITE_OPENAI_KEY=your_openai_api_key
VITE_OPENAI_MODEL=gpt-4o-mini

# Optional fallback
VITE_GROQ_KEY=your_groq_api_key
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

The library automatically switches between OpenAI and Groq if one fails.

## 💡 AIProvider — Props-based Configuration

Starting from v0.1.4, the AIProvider accepts API keys directly via props
(with fallback to environment variables if props are not provided).

Example:

```tsx
import {
  AIProvider,
  ChatBox,
  Summarizer,
  Translator,
  Rewriter,
} from "@mrszlv/ai-ui-components";
import "@mrszlv/ai-ui-components/style.css";

function App() {
  return (
    <AIProvider
      openaiKey={import.meta.env.VITE_OPENAI_KEY}
      openaiModel={import.meta.env.VITE_OPENAI_MODEL}
      groqKey={import.meta.env.VITE_GROQ_KEY}
      groqModel={import.meta.env.VITE_GROQ_MODEL}
      initialProvider="openai"
    >
      <main className="min-h-screen bg-neutral-950 text-white p-6">
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

## 🧩 Components

| Component        | Description                                   |
| ---------------- | --------------------------------------------- |
| `ChatBox`        | Full AI chat interface with message streaming |
| `Summarizer`     | Summarizes long articles or paragraphs        |
| `Translator`     | Translates between any languages              |
| `Rewriter`       | Rephrases text while preserving meaning       |
| `Button`, `Card` | Utility UI elements for layout and actions    |

## 🧠 Hook: useAI(model?: string)

```tsx
import { useAI } from "@mrszlv/ai-ui-components";

function Generator() {
  const { generate, chat, loading, error } = useAI("gpt-4o-mini");

  const handleClick = async () => {
    const text = await generate("Explain how React hooks work");
    console.log(text);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      Generate
    </button>
  );
}
```

## 🧱 Package Structure

```bash
packages/ai-ui/
 ├─ src/
 │   ├─ components/
 │   │   ├─ ChatBox/
 │   │   ├─ Translator/
 │   │   ├─ Summarizer/
 │   │   ├─ Rewriter/
 │   │   └─ ui/
 │   ├─ lib/
 │   │   ├─ ai/
 │   │   │   ├─ AIProvider.tsx
 │   │   │   ├─ useAI.ts
 │   │   │   ├─ AIContext.tsx
 │   │   │   └─ clients/
 │   ├─ index.ts
 │   └─ tailwind.css
 └─ dist/
```

## ⚡ Build & Development

### Build the package

```bash
npm run -w packages/ai-ui build:all
```

### Clean build

```bash
rm -rf packages/ai-ui/dist
npm run -w packages/ai-ui build:all
```

### Test locally

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🧾 Public Exports

```ts
export {
  AIProvider,
  useAI,
  ChatBox,
  Summarizer,
  Translator,
  Rewriter,
  Button,
  Card,
} from "@mrszlv/ai-ui-components";
```

## 🎨 TailwindCSS Integration

This library comes with a compiled index.css generated from Tailwind.
If your project already uses Tailwind, simply include the package’s CSS:

```tsx
import "@mrszlv/ai-ui-components/dist/index.css";
```

## 🧩 Tech Stack

- ⚛️ React 19
- 💨 TailwindCSS 3
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

- This project uses Changesets for versioning.
- All version updates are automatically tracked in CHANGELOG.md.

## 🧑‍💻 Development Workflow

```bash
# Install dependencies
npm install

# Watch mode
npm run -w packages/ai-ui dev

# Lint & format
npm run lint

# Commit with Husky hooks
git add .
git commit -m "feat: add new component"
```

## 🧾 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE)
file for details.

```less
MIT © 2025 [Miroslav Popovich](https://github.com/mrszlv)
```

## 🔗 Repository

[Repository](https://github.com/mrszlv/react-ai-kit-MVP-v1)

## 💬 Support / Feedback

If you encounter any issues or want to suggest a new feature,
please open an issue on GitHub Issues.

[GitHub Issues](https://github.com/mrszlv/react-ai-kit-MVP-v1/issues)

## ✨ Coming Soon

- 🧩 Theme tokens (light / dark mode)
- 🧠 Custom model switching via UI
- 💬 Context memory & message history
- 🌐 Multi-language interface support

Built with ❤️ by [Miroslav Popovich](https://github.com/mrszlv) for modern AI-driven UI experiences.

```yaml
---
Would you like me to make this version automatically include your **package badge and live demo link** (for example `demo.mrszlv.dev/ai-ui`), so it looks like a polished npm landing page?
```
