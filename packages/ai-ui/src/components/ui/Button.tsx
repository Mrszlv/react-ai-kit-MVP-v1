import React from "react";

import clsx from "clsx";

type Props = React.PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}>;

export const Button: React.FC<Props> = ({
  className,
  disabled,
  onClick,
  type = "button",
  children,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
      "bg-indigo-500 text-white hover:bg-indigo-600",
      "dark:bg-indigo-400 dark:hover:bg-indigo-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);
