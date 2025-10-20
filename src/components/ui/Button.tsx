import React from "react";

export const Button = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:opacity-90 active:opacity-80 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);
