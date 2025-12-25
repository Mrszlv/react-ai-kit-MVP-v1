# 🧠 React AI UI Components

---

[![npm version](https://img.shields.io/npm/v/@mrszlv/ai-ui-components.svg?color=gold&style=flat-square)](https://www.npmjs.com/package/@mrszlv/ai-ui-components)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/mrszlv/react-ai-kit-MVP-v1/build.yml?style=flat-square)](https://github.com/mrszlv/react-ai-kit-MVP-v1)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## ✨ Features

- ⚛️ React 18+
- 🎨 TailwindCSS styling
- 🤖 OpenAI & Groq support
- 🔐 License-based Pro components
- 📦 Works with Vite, CRA, Next.js

## 📦 Installation

```bash
npm install @mrszlv/ai-ui-components
```

## 🎨 Styles (required)

```ts
import "@mrszlv/ai-ui-components/style.css";
```

## 🚀 Basic usage

```tsx
import {
  AIProvider,
  LicenseProvider,
  ChatBox,
  Translator,
  Summarizer,
  Rewriter,
} from "@mrszlv/ai-ui-components";

import "@mrszlv/ai-ui-components/style.css";

export default function App() {
  return (
    <LicenseProvider licenseKey="YOUR_LICENSE_KEY">
      <AIProvider openaiKey={import.meta.env.VITE_OPENAI_API_KEY}>
        <ChatBox />
        <Translator />
        <Rewriter />
        <Summarizer />
      </AIProvider>
    </LicenseProvider>
  );
}
```

## 🔐 Pro components & License

Some components require a valid license.
Without a license, a built-in Paywall UI will be displayed.

### Pro components

- ChatBox
- Translator
- Rewriter
- Summarizer

## 🛒 Get a license

[👉 Get license](https://t.me/miroszlavpopovics)

## 🆓 Free vs Pro

| Feature / Component | Free | Pro |
| ------------------- | ---- | --- |
| Core infrastructure | ✅   | ✅  |
| AI Provider setup   | ✅   | ✅  |
| ChatBox             | ❌   | ✅  |
| Translator          | ❌   | ✅  |
| Rewriter            | ❌   | ✅  |
| Summarizer          | ❌   | ✅  |

## 🔗 Repository

[Git](https://github.com/mrszlv/react-ai-kit-MVP-v1)

## 🧾 License

- MIT — core infrastructure
- Commercial license required for Pro components

MIT © 2025 Miroslav Popovich
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE.md)
