import React, { useState } from "react";
import clsx from "clsx";

export const Tabs: React.FC<{
  tabs: { id: string; label: string; content: React.ReactNode }[];
  initialId?: string;
}> = ({ tabs, initialId }) => {
  const [active, setActive] = useState<string>(initialId ?? tabs[0].id);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-2xl border bg-white/70 p-1 dark:bg-slate-900/60 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={clsx(
              "px-4 py-2 text-sm rounded-xl transition",
              active === t.id
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border p-4 bg-white/70 dark:bg-slate-900/60 dark:border-slate-800">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
};
