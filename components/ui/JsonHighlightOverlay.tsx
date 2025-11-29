"use client";

import type { HighlightSegment } from "@/lib/useJsonSearch";

type JsonHighlightOverlayProps = {
  segments: HighlightSegment[];
  highlightRef: React.RefObject<HTMLPreElement | null>;
  matchRefs: React.MutableRefObject<Array<HTMLElement | null>>;
  onScroll: (event: React.UIEvent<HTMLPreElement>) => void;
};

const JsonHighlightOverlay = ({ segments, highlightRef, matchRefs, onScroll }: JsonHighlightOverlayProps) => {
  return (
    <pre
      ref={highlightRef}
      aria-hidden
      onScroll={onScroll}
      className="pointer-events-none absolute inset-0 z-0 max-h-[520px] overflow-auto rounded-2xl bg-slate-900/80 p-4 text-sm leading-6 text-transparent shadow-inner whitespace-pre-wrap break-words"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      }}
    >
      {segments.map((segment, index) =>
        segment.highlight ? (
          <mark
            key={`highlight-${segment.matchIndex}-${index}`}
            ref={(element) => {
              if (segment.matchIndex !== null && element) {
                matchRefs.current[segment.matchIndex] = element;
              }
            }}
            className="rounded bg-[#ffe600] px-0.5 text-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`text-${index}`} className="text-transparent">
            {segment.text}
          </span>
        ),
      )}
    </pre>
  );
};

export default JsonHighlightOverlay;

