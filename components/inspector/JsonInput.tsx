"use client";

import { useEffect, useRef, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";
import { useJsonSearch } from "@/lib/useJsonSearch";
import JsonSearchBar from "@/components/ui/JsonSearchBar";
import JsonHighlightOverlay from "@/components/ui/JsonHighlightOverlay";

type JsonInputProps = {
  initialValue: string;
  onJsonChange: (value: JsonValue) => void;
  onTextChange?: (text: string) => void;
};

const JsonInput = ({ initialValue, onJsonChange, onTextChange }: JsonInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const search = useJsonSearch(value, textareaRef, highlightRef);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    onTextChange?.(nextValue);
    try {
      const parsed = JSON.parse(nextValue) as JsonValue;
      setError(null);
      onJsonChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value) as JsonValue;
      const formatted = JSON.stringify(parsed, null, 2);
      setValue(formatted);
      search.setMatchIndex(0);
      setError(null);
      onJsonChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLPreElement>) => {
    if (textareaRef.current && search.searchTerm.trim()) {
      textareaRef.current.scrollTop = event.currentTarget.scrollTop;
      textareaRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">JSON INPUT</p>
          <p className="text-sm text-slate-400">Paste JSON - updates propagate instantly.</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-300 hover:text-emerald-200"
          onClick={handleFormat}
        >
          Format JSON
        </button>
      </div>
      <JsonSearchBar
        searchTerm={search.searchTerm}
        onSearchChange={search.setSearchTerm}
        matchCount={search.matchCount}
        matchIndex={search.safeMatchIndex}
        onPrev={() => search.goToMatch(-1)}
        onNext={() => search.goToMatch(1)}
      />
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
          className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-xs text-slate-200 backdrop-blur transition hover:border-emerald-300 hover:text-white"
        >
          {copied ? "✓" : "⧉"}
        </button>
        {search.searchTerm.trim() && (
          <JsonHighlightOverlay
            segments={search.highlightSegments}
            highlightRef={highlightRef}
            matchRefs={search.matchRefs}
            onScroll={handleScroll}
          />
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleValueChange(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current && search.searchTerm.trim()) {
              highlightRef.current.scrollTop = event.currentTarget.scrollTop;
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          className={`relative z-10 h-[520px] w-full resize-none rounded-2xl border bg-slate-900/80 p-4 text-sm leading-6 text-slate-100 shadow-inner outline-none transition focus:ring-2 focus:ring-emerald-400/60 ${
            error ? "border-rose-400/70" : "border-white/10"
          }`}
          spellCheck={false}
          style={{
            backgroundColor: "rgba(15,23,42,0.8)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-300">Syntax error: {error}</p>
      ) : (
        <p className="text-xs text-slate-500">Valid JSON ready</p>
      )}
    </div>
  );
};

export default JsonInput;
