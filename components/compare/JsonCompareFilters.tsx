"use client";

import type { JsonDiff } from "@/lib/jsonCompare";

type JsonCompareFiltersProps = {
  filters: Record<JsonDiff["type"], boolean>;
  onToggle: (type: JsonDiff["type"]) => void;
  counts: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
};

const JsonCompareFilters = ({ filters, onToggle, counts }: JsonCompareFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <button
        type="button"
        onClick={() => onToggle("added")}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
          filters.added
            ? "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-600 dark:text-slate-400 hover:border-emerald-500 dark:hover:border-emerald-500/30 shadow-sm dark:shadow-none"
        }`}
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Added:</span>
        <span className="font-semibold">{counts.added}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle("removed")}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
          filters.removed
            ? "border-rose-500 bg-rose-500 text-white dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-300"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-600 dark:text-slate-400 hover:border-rose-500 dark:hover:border-rose-500/30 shadow-sm dark:shadow-none"
        }`}
      >
        <div className="h-2 w-2 rounded-full bg-rose-500" />
        <span>Removed:</span>
        <span className="font-semibold">{counts.removed}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle("modified")}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
          filters.modified
            ? "border-amber-500 bg-amber-500 text-white dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-300"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-600 dark:text-slate-400 hover:border-amber-500 dark:hover:border-amber-500/30 shadow-sm dark:shadow-none"
        }`}
      >
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span>Modified:</span>
        <span className="font-semibold">{counts.modified}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle("unchanged")}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
          filters.unchanged
            ? "border-gray-400 bg-gray-400 text-white dark:border-slate-500/50 dark:bg-slate-500/20 dark:text-slate-300"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500/30 shadow-sm dark:shadow-none"
        }`}
      >
        <div className="h-2 w-2 rounded-full bg-slate-500" />
        <span>Unchanged:</span>
        <span className="font-semibold">{counts.unchanged}</span>
      </button>
    </div>
  );
};

export default JsonCompareFilters;

