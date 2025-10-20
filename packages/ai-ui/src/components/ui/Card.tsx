// src/components/ui/Card.tsx
import React from "react";

type CardProps = { children: React.ReactNode; className?: string };

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`w-full block rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
};
