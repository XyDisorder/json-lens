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
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "removed":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "modified":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-800/50 text-slate-400 border-slate-700/30";
    }
  };

  const formatValue = (value: JsonValue | undefined): string => {
    if (value === undefined) return "undefined";
    return JSON.stringify(value, null, 2);
  };

  return (
    <div key={`${diff.path}-${index}`} className={`rounded-xl border p-3 text-sm ${getDiffColor(diff.type)}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold">{diff.path}</span>
        <span className="rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide">{diff.type}</span>
      </div>
      <div className="grid gap-2 font-mono text-xs">
        {diff.leftValue !== undefined && (
          <div>
            <span className="text-slate-500">Left:</span>
            <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2">{formatValue(diff.leftValue)}</pre>
          </div>
        )}
        {diff.rightValue !== undefined && (
          <div>
            <span className="text-slate-500">Right:</span>
            <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2">{formatValue(diff.rightValue)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonDiffItem;

