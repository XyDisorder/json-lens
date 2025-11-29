"use client";

import { useEffect, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";
import type { JsonDiff } from "@/lib/jsonCompare";
import JsonDiffView from "@/components/compare/JsonDiffView";
import JsonCompareTextarea from "@/components/compare/JsonCompareTextarea";

type JsonCompareInputProps = {
  onLeftChange: (value: JsonValue | null) => void;
  onRightChange: (value: JsonValue | null) => void;
  diffs?: JsonDiff[];
  initialLeftValue?: string;
  initialRightValue?: string;
  storageKeyLeft?: string;
  storageKeyRight?: string;
};

const JsonCompareInput = ({
  onLeftChange,
  onRightChange,
  diffs = [],
  initialLeftValue = "",
  initialRightValue = "",
  storageKeyLeft,
  storageKeyRight,
}: JsonCompareInputProps) => {
  const [leftValue, setLeftValue] = useState(initialLeftValue);
  const [rightValue, setRightValue] = useState(initialRightValue);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);

  useEffect(() => {
    if (initialLeftValue !== undefined) {
      setLeftValue(initialLeftValue);
    }
  }, [initialLeftValue]);

  useEffect(() => {
    if (initialRightValue !== undefined) {
      setRightValue(initialRightValue);
    }
  }, [initialRightValue]);

  useEffect(() => {
    if (storageKeyLeft && typeof window !== "undefined") {
      if (leftValue) {
        localStorage.setItem(storageKeyLeft, leftValue);
      } else {
        localStorage.removeItem(storageKeyLeft);
      }
    }
  }, [leftValue, storageKeyLeft]);

  useEffect(() => {
    if (storageKeyRight && typeof window !== "undefined") {
      if (rightValue) {
        localStorage.setItem(storageKeyRight, rightValue);
      } else {
        localStorage.removeItem(storageKeyRight);
      }
    }
  }, [rightValue, storageKeyRight]);

  const formatJson = (value: string, setter: (v: string) => void, errorSetter: (e: string | null) => void) => {
    try {
      const parsed = JSON.parse(value) as JsonValue;
      setter(JSON.stringify(parsed, null, 2));
      errorSetter(null);
    } catch (err) {
      errorSetter(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleLeftFormat = () => formatJson(leftValue, setLeftValue, setLeftError);
  const handleRightFormat = () => formatJson(rightValue, setRightValue, setRightError);

  const handleLeftClear = () => {
    setLeftValue("");
    setLeftError(null);
    onLeftChange(null);
  };

  const handleRightClear = () => {
    setRightValue("");
    setRightError(null);
    onRightChange(null);
  };

  const canShowDiff = !leftError && !rightError && leftValue && rightValue;

  return (
    <div className="space-y-4">
      {canShowDiff && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-600 dark:text-slate-400">View mode:</span>
          <div className="flex rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 p-1 text-gray-800 dark:text-white shadow-sm dark:shadow-none">
            <button
              type="button"
              onClick={() => setShowDiffView(false)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                !showDiffView ? "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-white" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setShowDiffView(true)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                showDiffView ? "bg-amber-500 text-white dark:bg-amber-400/20 dark:text-amber-300" : "text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-200"
              }`}
            >
              Diff
            </button>
          </div>
        </div>
      )}

      {showDiffView && canShowDiff ? (
        <JsonDiffView leftJson={leftValue} rightJson={rightValue} diffs={diffs} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <JsonCompareTextarea
            value={leftValue}
            onChange={setLeftValue}
            onJsonChange={onLeftChange}
            diffs={diffs}
            isLeft={true}
            label="JSON LEFT"
            labelColor="text-emerald-300"
            placeholder='{"key": "value"}'
            onFormat={handleLeftFormat}
            onClear={handleLeftClear}
          />
          <JsonCompareTextarea
            value={rightValue}
            onChange={setRightValue}
            onJsonChange={onRightChange}
            diffs={diffs}
            isLeft={false}
            label="JSON RIGHT"
            labelColor="text-amber-300"
            placeholder='{"key": "value"}'
            onFormat={handleRightFormat}
            onClear={handleRightClear}
          />
        </div>
      )}
    </div>
  );
};

export default JsonCompareInput;
