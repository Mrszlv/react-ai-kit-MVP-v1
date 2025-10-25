import React from "react";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <img className="footer__icon" src="/svg/logo.svg" alt="logo" />
        <p className="footer__text">
          © {new Date().getFullYear()} AI-UI Components. Built with using React,
          Vite & TypeScript.
        </p>

        <div className="footer__links">
          <a
            href="https://github.com/yourusername/react-ai-kit-MVP-v1"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
