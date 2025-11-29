"use client";

import { useMemo, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";
import { compareJson, type JsonDiff } from "@/lib/jsonCompare";
import JsonCompareFilters from "@/components/compare/JsonCompareFilters";
import JsonDiffItem from "@/components/compare/JsonDiffItem";

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

  const counts = useMemo(
    () => ({
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      unchanged: unchangedCount,
    }),
    [addedCount, removedCount, modifiedCount, unchangedCount],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-4 shadow-sm dark:shadow-none">
        <JsonCompareFilters filters={filters} onToggle={toggleFilter} counts={counts} />
        <div className="text-xs text-gray-600 dark:text-slate-500">
          Showing: <span className="font-semibold text-gray-900 dark:text-white">{filteredDiffs.length}</span> /{" "}
          <span className="text-gray-500 dark:text-slate-400">{diffs.length}</span>
        </div>
      </div>

      <div className="max-h-[480px] space-y-2 overflow-auto rounded-2xl bg-white dark:bg-slate-950/50 p-4 border border-gray-200 dark:border-transparent">
        {diffs.length === 0 ? (
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">No differences found — JSONs are identical</p>
        ) : filteredDiffs.length === 0 ? (
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">No differences match the selected filters</p>
        ) : (
          filteredDiffs.map((diff, index) => <JsonDiffItem key={`${diff.path}-${index}`} diff={diff} index={index} />)
        )}
      </div>
    </div>
  );
};

export default JsonCompare;

