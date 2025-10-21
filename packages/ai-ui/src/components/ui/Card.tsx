import React from "react";
import clsx from "clsx";

type CardProps = { children: React.ReactNode; className?: string };

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
};
