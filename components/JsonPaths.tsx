"use client";

import { useState } from "react";

type JsonPathsProps = {
  paths: string[];
  searchTerm?: string;
};

const JsonPaths = ({ paths, searchTerm = "" }: JsonPathsProps) => {
  const [copied, setCopied] = useState(false);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visiblePaths = normalizedSearch
    ? paths.filter((path) => path.toLowerCase().includes(normalizedSearch))
    : paths;

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(visiblePaths.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          {visiblePaths.length} / {paths.length} paths
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300 hover:text-emerald-200"
        >
          {copied ? "Copied" : "Copy All"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs leading-6 text-slate-200 shadow-inner">
        {visiblePaths.join("\n")}
      </pre>
    </div>
  );
};

export default JsonPaths;
