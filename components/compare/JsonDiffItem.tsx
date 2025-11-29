"use client";

import type { JsonDiff } from "@/lib/jsonCompare";
import type { JsonValue } from "@/lib/treeBuilder";

type JsonDiffItemProps = {
  diff: JsonDiff;
  index: number;
};

const JsonDiffItem = ({ diff, index }: JsonDiffItemProps) => {
  const getDiffColor = (type: JsonDiff["type"]) => {
    switch (type) {
      case "added":
        return "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
      case "removed":
        return "bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30";
      case "modified":
        return "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
      default:
        return "bg-white dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700/30";
    }
  };

  const formatValue = (value: JsonValue | undefined): string => {
    if (value === undefined) return "undefined";
    return JSON.stringify(value, null, 2);
  };

  return (
    <div key={`${diff.path}-${index}`} className={`rounded-xl border p-3 text-sm ${getDiffColor(diff.type)}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{diff.path}</span>
        <span className="rounded-full border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent px-2 py-0.5 text-xs uppercase tracking-wide text-gray-700 dark:text-white">{diff.type}</span>
      </div>
      <div className="grid gap-2 font-mono text-xs">
        {diff.leftValue !== undefined && (
          <div>
            <span className="text-gray-600 dark:text-slate-500">Left:</span>
            <pre className="mt-1 overflow-x-auto rounded bg-white dark:bg-black/30 p-2 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent">{formatValue(diff.leftValue)}</pre>
          </div>
        )}
        {diff.rightValue !== undefined && (
          <div>
            <span className="text-gray-600 dark:text-slate-500">Right:</span>
            <pre className="mt-1 overflow-x-auto rounded bg-white dark:bg-black/30 p-2 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent">{formatValue(diff.rightValue)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonDiffItem;

