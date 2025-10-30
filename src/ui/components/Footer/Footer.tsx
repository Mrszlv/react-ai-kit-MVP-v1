import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 py-4 lg:py-5 text-sm">
          {/* Лого + текст */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            <img
              src="/svg/logo.svg"
              alt="AI-UI Logo"
              width={30}
              height={30}
              className="shrink-0"
            />
            <p className="text-center md:text-left">
              © 2025{"  "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                AI-UI Components
              </span>
              . Built with React, Vite & TypeScript.
            </p>
          </div>

          <a
            href="https://github.com/Mrszlv/react-ai-kit-MVP-v1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
