import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="mb-10 w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 lg:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/svg/logo.svg"
              alt="AI-UI Logo"
              width={30}
              height={30}
              className="shrink-0"
            />
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg lg:text-xl">
                AI-UI Components
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                React library of AI-powered UI components — Chat, Translator,
                Rewriter, Summarizer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
