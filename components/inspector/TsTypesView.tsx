"use client";

import { useState } from "react";

type TsTypesViewProps = {
  types: string;
};

const TsTypesView = ({ types }: TsTypesViewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(types);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-600 dark:text-slate-400">Derived TypeScript types</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-gray-200 dark:border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-white transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-200 shadow-sm dark:shadow-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto rounded-2xl bg-white dark:bg-slate-950/50 p-4 text-xs leading-6 text-emerald-700 dark:text-emerald-50 shadow-inner border border-gray-200 dark:border-transparent">
        {types}
      </pre>
    </div>
  );
};

export default TsTypesView;
