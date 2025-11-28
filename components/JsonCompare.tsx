"use client";

import { useMemo, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";
import { compareJson, type JsonDiff } from "@/lib/jsonCompare";

type JsonCompareProps = {
  leftJson: JsonValue;
  rightJson: JsonValue;
};

const JsonCompare = ({ leftJson, rightJson }: JsonCompareProps) => {
  const [filters, setFilters] = useState<Record<JsonDiff["type"], boolean>>({
    added: true,
    removed: true,
    modified: true,
    unchanged: false,
  });

  const diffs = useMemo(() => compareJson(leftJson, rightJson), [leftJson, rightJson]);

  const addedCount = diffs.filter((d) => d.type === "added").length;
  const removedCount = diffs.filter((d) => d.type === "removed").length;
  const modifiedCount = diffs.filter((d) => d.type === "modified").length;
  const unchangedCount = diffs.filter((d) => d.type === "unchanged").length;

  const filteredDiffs = useMemo(
    () => diffs.filter((diff) => filters[diff.type]),
    [diffs, filters],
  );

  const toggleFilter = (type: JsonDiff["type"]) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggleFilter("added")}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
              filters.added
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                : "border-white/10 bg-black/30 text-slate-400 hover:border-emerald-500/30"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Added:</span>
            <span className="font-semibold">{addedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleFilter("removed")}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
              filters.removed
                ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                : "border-white/10 bg-black/30 text-slate-400 hover:border-rose-500/30"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Removed:</span>
            <span className="font-semibold">{removedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleFilter("modified")}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
              filters.modified
                ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-black/30 text-slate-400 hover:border-amber-500/30"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Modified:</span>
            <span className="font-semibold">{modifiedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleFilter("unchanged")}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
              filters.unchanged
                ? "border-slate-500/50 bg-slate-500/20 text-slate-300"
                : "border-white/10 bg-black/30 text-slate-400 hover:border-slate-500/30"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-slate-500" />
            <span>Unchanged:</span>
            <span className="font-semibold">{unchangedCount}</span>
          </button>
        </div>
        <div className="text-xs text-slate-500">
          Showing: <span className="font-semibold text-white">{filteredDiffs.length}</span> /{" "}
          <span className="text-slate-400">{diffs.length}</span>
        </div>
      </div>

      <div className="max-h-[480px] space-y-2 overflow-auto rounded-2xl bg-slate-950/50 p-4">
        {diffs.length === 0 ? (
          <p className="text-center text-sm text-slate-400">No differences found — JSONs are identical</p>
        ) : filteredDiffs.length === 0 ? (
          <p className="text-center text-sm text-slate-400">No differences match the selected filters</p>
        ) : (
          filteredDiffs.map((diff, index) => (
            <div
              key={`${diff.path}-${index}`}
              className={`rounded-xl border p-3 text-sm ${getDiffColor(diff.type)}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold">{diff.path}</span>
                <span className="rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide">
                  {diff.type}
                </span>
              </div>
              <div className="grid gap-2 font-mono text-xs">
                {diff.leftValue !== undefined && (
                  <div>
                    <span className="text-slate-500">Left:</span>
                    <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2">
                      {formatValue(diff.leftValue)}
                    </pre>
                  </div>
                )}
                {diff.rightValue !== undefined && (
                  <div>
                    <span className="text-slate-500">Right:</span>
                    <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2">
                      {formatValue(diff.rightValue)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JsonCompare;

