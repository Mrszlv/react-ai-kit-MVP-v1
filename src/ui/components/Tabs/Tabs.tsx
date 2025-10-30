import React from "react";

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
    <nav className="w-full flex justify-center mt-6 mb-10">
      <ul className="flex flex-wrap gap-0.5 sm:gap-3 justify-center">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() =>
                onChange(
                  tab.id as "chat" | "translator" | "rewriter" | "summarizer"
                )
              }
              className={`px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-full font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-indigo-500 text-white shadow-md dark:bg-indigo-400"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
