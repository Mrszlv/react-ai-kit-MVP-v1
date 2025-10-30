import React, { useState } from "react";
import "./App.css";

import { ChatDemo } from "./ui/components";
import { RewriterDemo } from "./ui/components";
import { SummarizerDemo } from "./ui/components";
import { TranslatorDemo } from "./ui/components";

import { Header } from "./ui/components";
import { Footer } from "./ui/components";
import { Tabs } from "./ui/components";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "chat" | "translator" | "rewriter" | "summarizer"
  >("chat");

  return (
    <div className="app">
      <Header />

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="app__content">
        {activeTab === "chat" && <ChatDemo />}
        {activeTab === "translator" && <TranslatorDemo />}
        {activeTab === "rewriter" && <RewriterDemo />}
        {activeTab === "summarizer" && <SummarizerDemo />}
      </main>

      <p className="block sm:hidden text-center text-sm text-slate-900 dark:text-slate-400 mb-4">
        React library of AI-powered UI components — Chat, Translator, Rewriter,
        Summarizer
      </p>

      <Footer />
    </div>
  );
};

export default App;
