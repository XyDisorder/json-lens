"use client";

import { useEffect, useRef, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";
import type { JsonDiff } from "@/lib/jsonCompare";
import { useJsonCompareHighlight, type LineSegment } from "@/lib/useJsonCompareHighlight";

type JsonCompareTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onJsonChange: (value: JsonValue | null) => void;
  diffs: JsonDiff[];
  isLeft: boolean;
  label: string;
  labelColor: string;
  placeholder?: string;
  onFormat: () => void;
  onClear: () => void;
  storageKey?: string;
};

const getHighlightColor = (type: JsonDiff["type"]) => {
  switch (type) {
    case "added":
      return "bg-emerald-300/30 dark:bg-emerald-500/40 border-l-4 border-emerald-500 dark:border-emerald-400";
    case "removed":
      return "bg-rose-300/30 dark:bg-rose-500/40 border-l-4 border-rose-500 dark:border-rose-400";
    case "modified":
      return "bg-amber-300/30 dark:bg-amber-500/40 border-l-4 border-amber-500 dark:border-amber-400";
    default:
      return "";
  }
};

const JsonCompareTextarea = ({
  value,
  onChange,
  onJsonChange,
  diffs,
  isLeft,
  label,
  labelColor,
  placeholder,
  onFormat,
  onClear,
}: JsonCompareTextareaProps) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const highlightRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { highlightLines, segments } = useJsonCompareHighlight(value, diffs, isLeft);

  // Check if JSON is valid on mount and when value changes
  useEffect(() => {
    if (!value) {
      setError(null);
      return;
    }
    try {
      JSON.parse(value) as JsonValue;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, [value]);

  // Sync scroll between textarea and overlay
  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = highlightRef.current;
    if (!textarea || !overlay) return;

    const handleScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    try {
      const parsed = JSON.parse(newValue) as JsonValue;
      setError(null);
      onJsonChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      onJsonChange(null);
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.2em] ${labelColor}`}>{label}</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">{isLeft ? "First JSON to compare" : "Second JSON to compare"}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onFormat}
              className={`rounded-full border border-gray-200 dark:border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-white transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-200 shadow-sm dark:shadow-none`}
            >
              Format
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-gray-200 dark:border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 transition hover:border-rose-500 hover:bg-rose-50 dark:hover:border-rose-300 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-200 shadow-sm dark:shadow-none"
            >
              Clear
            </button>
          </div>
        </div>
      <div className="relative">
        <button
          type="button"
          title="Copy JSON"
          aria-label="Copy JSON"
          onClick={async () => {
            if (typeof navigator === "undefined" || !navigator.clipboard) return;
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            } catch (err) {
              console.error(err);
            }
          }}
          className={`absolute right-4 top-4 z-20 rounded-full border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-2 py-1 text-xs text-gray-700 dark:text-slate-200 backdrop-blur transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-white shadow-sm dark:shadow-none`}
        >
          {copied ? "✓" : "⧉"}
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className={`relative z-10 h-[520px] w-full resize-none rounded-2xl border bg-white dark:bg-slate-900/80 p-4 text-sm leading-6 text-gray-900 dark:text-slate-100 shadow-inner outline-none transition focus:ring-2 ${
            isLeft ? "focus:ring-emerald-400/60" : "focus:ring-amber-400/60"
          } ${error ? "border-rose-400/70" : "border-gray-200 dark:border-white/10"}`}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          spellCheck={false}
          placeholder={placeholder}
        />
        {!error && highlightLines.size > 0 && segments.length > 0 && (
          <pre
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 max-h-[520px] overflow-auto rounded-2xl bg-transparent p-4 text-sm leading-6 text-transparent whitespace-pre-wrap break-words"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            }}
          >
            {segments.map((segment, index) =>
              segment.highlight && segment.type ? (
                <mark key={`${isLeft ? "left" : "right"}-${index}`} className={`block ${getHighlightColor(segment.type)} text-transparent`}>
                  {segment.text}
                  {!segment.isLastLine && "\n"}
                </mark>
              ) : (
                <span key={`${isLeft ? "left" : "right"}-${index}`} className="text-transparent">
                  {segment.text}
                  {!segment.isLastLine && "\n"}
                </span>
              ),
            )}
          </pre>
        )}
      </div>
      {error ? (
        <p className="text-sm text-rose-300">Error: {error}</p>
      ) : value ? (
        <p className="text-xs text-slate-500">Valid JSON ✓</p>
      ) : null}
    </div>
  );
};

export default JsonCompareTextarea;

