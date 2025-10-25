import React from "react";
import "./Tabs.css";

type TabsProps = {
  activeTab: "chat" | "translator" | "rewriter" | "summarizer";
  onChange: (tab: "chat" | "translator" | "rewriter" | "summarizer") => void;
};

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange }) => {
  const tabs = [
    { id: "chat", label: "Chat" },
    { id: "translator", label: "Translator" },
    { id: "rewriter", label: "Rewriter" },
    { id: "summarizer", label: "Summarizer" },
  ];

  return (
    <nav className="tabs">
      <ul className="tabs__list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              className={`tabs__button ${
                activeTab === tab.id ? "tabs__button--active" : ""
              }`}
              onClick={() =>
                onChange(
                  tab.id as "chat" | "translator" | "rewriter" | "summarizer"
                )
              }
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
