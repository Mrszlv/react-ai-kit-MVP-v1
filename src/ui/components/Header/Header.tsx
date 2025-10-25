import React from "react";
import "./Header.css";

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo">
          <img className="header__icon" src="/svg/logo.svg" alt="logo" />
          <h1 className="header__title">AI-UI Components</h1>
        </div>

        <p className="header__subtitle">
          React library of AI-powered UI components — Chat, Translator,
          Rewriter, Summarizer
        </p>
      </div>
    </header>
  );
};
