"use client";

import { useRef, useState } from "react";
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
      return "bg-emerald-500/40 border-l-2 border-emerald-500/60";
    case "removed":
      return "bg-rose-500/40 border-l-2 border-rose-500/60";
    case "modified":
      return "bg-amber-500/40 border-l-2 border-amber-500/60";
    default:
      return "bg-slate-700/30 border-l-2 border-slate-500/40";
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
          <p className="text-xs text-slate-400">{isLeft ? "First JSON to compare" : "Second JSON to compare"}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onFormat}
            className={`rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:${labelColor.replace("text-", "border-")} hover:${labelColor}`}
          >
            Format
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:border-rose-300 hover:text-rose-200"
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
          className={`absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-xs text-slate-200 backdrop-blur transition hover:${labelColor.replace("text-", "border-")} hover:text-white`}
        >
          {copied ? "✓" : "⧉"}
        </button>
        {highlightLines.size > 0 && (
          <pre
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 max-h-[520px] overflow-auto rounded-2xl bg-slate-900/80 p-4 text-sm leading-6 text-transparent shadow-inner whitespace-pre-wrap break-words"
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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current) {
              highlightRef.current.scrollTop = event.currentTarget.scrollTop;
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          className={`relative z-10 h-[520px] w-full resize-none rounded-2xl border bg-slate-900/80 p-4 text-sm leading-6 text-slate-100 shadow-inner outline-none transition focus:ring-2 ${
            isLeft ? "focus:ring-emerald-400/60" : "focus:ring-amber-400/60"
          } ${error ? "border-rose-400/70" : "border-white/10"}`}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            backgroundColor: "rgba(15,23,42,0.8)",
          }}
          spellCheck={false}
          placeholder={placeholder}
        />
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

