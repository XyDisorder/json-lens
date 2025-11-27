"use client";

import { useMemo, useRef, useState } from "react";
import type { JsonValue } from "@/lib/treeBuilder";

type JsonInputProps = {
  initialValue: string;
  onJsonChange: (value: JsonValue) => void;
};

const JsonInput = ({ initialValue, onJsonChange }: JsonInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const escapeRegex = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = useMemo(() => {
    if (!normalizedSearch) return [];
    const indices: number[] = [];
    const haystack = value.toLowerCase();
    const needle = normalizedSearch;
    let currentIndex = haystack.indexOf(needle);
    while (currentIndex !== -1) {
      indices.push(currentIndex);
      currentIndex = haystack.indexOf(needle, currentIndex + needle.length);
    }
    return indices;
  }, [normalizedSearch, value]);

  const matchCount = matches.length;
  const safeMatchIndex =
    matchCount === 0 ? 0 : ((matchIndex % matchCount) + matchCount) % matchCount;

  type HighlightSegment = {
    text: string;
    highlight: boolean;
    matchIndex: number | null;
  };

  const highlightSegments = useMemo<HighlightSegment[]>(() => {
    if (!normalizedSearch) {
      return [{ text: value || "\u200B", highlight: false, matchIndex: null }];
    }
    const regex = new RegExp(`(${escapeRegex(normalizedSearch)})`, "gi");
    const parts = value.split(regex);
    let matchCounter = -1;
    return parts.map((segment, index) => {
      const highlight = index % 2 === 1;
      const text = segment === "" ? "\u200B" : segment;
      const matchIndex = highlight ? (matchCounter += 1) : null;
      return { text, highlight, matchIndex };
    });
  }, [normalizedSearch, value]);

  const matchRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const selectMatch = (index: number) => {
    if (!matchCount || !normalizedSearch) return;
    const textarea = textareaRef.current;
    const overlay = highlightRef.current;
    if (!textarea || !overlay) return;
    const targetMark = matchRefs.current[index];
    const wasTextareaFocused = typeof document !== "undefined" && document.activeElement === textarea;

    if (targetMark) {
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
      const targetTop =
        targetMark.offsetTop - overlay.offsetTop - overlay.clientHeight / 2 + targetMark.clientHeight / 2;
      const maxScrollTop = textarea.scrollHeight - textarea.clientHeight;
      const clampedTop = clamp(targetTop, 0, maxScrollTop);
      overlay.scrollTop = clampedTop;
      textarea.scrollTop = clampedTop;

      const targetLeft =
        targetMark.offsetLeft - overlay.offsetLeft - overlay.clientWidth / 2 + targetMark.clientWidth / 2;
      const maxScrollLeft = textarea.scrollWidth - textarea.clientWidth;
      const clampedLeft = clamp(targetLeft, 0, Math.max(0, maxScrollLeft));
      overlay.scrollLeft = clampedLeft;
      textarea.scrollLeft = clampedLeft;
    }

    if (wasTextareaFocused) {
      const start = matches[index];
      const end = start + normalizedSearch.length;
      requestAnimationFrame(() => {
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(start, end);
      });
    }
  };

  const goToMatch = (direction: 1 | -1) => {
    if (!matchCount) return;
    setMatchIndex((prev) => {
      const next = (prev + direction + matchCount) % matchCount;
      selectMatch(next);
      return next;
    });
  };

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    try {
      const parsed = JSON.parse(nextValue) as JsonValue;
      setError(null);
      onJsonChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
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
          onClick={() => {
            try {
              const parsed = JSON.parse(value) as JsonValue;
              const formatted = JSON.stringify(parsed, null, 2);
              setValue(formatted);
              setMatchIndex(0);
              setError(null);
              onJsonChange(parsed);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Invalid JSON");
            }
          }}
        >
          Format JSON
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/20 p-3 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-1 items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Search JSON</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setMatchIndex(0);
            }}
            placeholder="property, key, value..."
            className="w-full rounded-full bg-slate-900/60 px-3 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {matchCount
              ? `Match ${safeMatchIndex + 1}/${matchCount}`
              : normalizedSearch
                ? "No matches"
                : "Idle"}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => goToMatch(-1)}
              disabled={!matchCount}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => goToMatch(1)}
              disabled={!matchCount}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30"
            >
              Next
            </button>
          </div>
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
          className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-xs text-slate-200 backdrop-blur transition hover:border-emerald-300 hover:text-white"
        >
          {copied ? "✓" : "⧉"}
        </button>
        {normalizedSearch && (
          <pre
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 max-h-[520px] overflow-auto rounded-2xl bg-slate-900/80 p-4 text-sm leading-6 text-transparent shadow-inner"
          >
            {highlightSegments.map((segment, index) =>
              segment.highlight ? (
                <mark
                  key={`${segment.text}-${index}`}
                  ref={(element) => {
                    if (segment.matchIndex !== null) {
                      matchRefs.current[segment.matchIndex] = element;
                    }
                  }}
                  className="rounded bg-[#ffe600] px-0.5 text-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={`${segment.text}-${index}`} className="text-transparent">
                  {segment.text}
                </span>
              ),
            )}
            {"\n"}
          </pre>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleValueChange(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current && normalizedSearch) {
              highlightRef.current.scrollTop = event.currentTarget.scrollTop;
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          className={`relative z-10 h-[520px] w-full resize-none rounded-2xl border bg-slate-900/80 p-4 text-sm leading-6 text-slate-100 shadow-inner outline-none transition focus:ring-2 focus:ring-emerald-400/60 ${
            error ? "border-rose-400/70" : "border-white/10"
          }`}
          spellCheck={false}
          style={{ backgroundColor: "rgba(15,23,42,0.8)" }}
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
