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
        <p className="text-slate-400">Derived TypeScript types</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300 hover:text-emerald-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs leading-6 text-emerald-50 shadow-inner">
        {types}
      </pre>
    </div>
  );
};

export default TsTypesView;
