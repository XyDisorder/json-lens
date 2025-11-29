"use client";

import { useMemo, useRef } from "react";
import { computeLineDiffs, type LineDiff } from "@/lib/jsonDiffLines";
import type { JsonDiff } from "@/lib/jsonCompare";

type JsonDiffViewProps = {
  leftJson: string;
  rightJson: string;
  diffs: JsonDiff[];
};

const JsonDiffView = ({ leftJson, rightJson, diffs }: JsonDiffViewProps) => {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const lineDiffs = useMemo(
    () => computeLineDiffs(leftJson || "", rightJson || "", diffs),
    [leftJson, rightJson, diffs],
  );

  const getLineBgColor = (type: LineDiff["type"], isLeft: boolean) => {
    switch (type) {
      case "added":
        return isLeft ? "" : "bg-emerald-500/15";
      case "removed":
        return isLeft ? "bg-rose-500/15" : "";
      case "modified":
        return "bg-amber-500/15";
      default:
        return "";
    }
  };

  const getLineBorderColor = (type: LineDiff["type"]) => {
    switch (type) {
      case "added":
        return "border-l-emerald-500";
      case "removed":
        return "border-l-rose-500";
      case "modified":
        return "border-l-amber-500";
      default:
        return "border-l-transparent";
    }
  };

  const getLineTextColor = (type: LineDiff["type"], isLeft: boolean) => {
    switch (type) {
      case "added":
        return isLeft ? "text-slate-600" : "text-emerald-200";
      case "removed":
        return isLeft ? "text-rose-200" : "text-slate-600";
      case "modified":
        return "text-amber-200";
      default:
        return "text-slate-200";
    }
  };

  const handleLeftScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  const handleRightScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
      {/* Left side */}
      <div className="relative border-r border-white/10">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          JSON LEFT
        </div>
        <div
          ref={leftScrollRef}
          onScroll={handleLeftScroll}
          className="max-h-[520px] overflow-auto font-mono text-sm leading-6"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          {lineDiffs.map((lineDiff, index) => (
            <div
              key={`left-${index}`}
              className={`flex border-l-2 ${getLineBorderColor(lineDiff.type)} ${getLineBgColor(lineDiff.type, true)}`}
            >
              <div className="flex-shrink-0 w-12 px-2 py-0.5 text-right text-xs text-slate-500 select-none bg-slate-900/50">
                {lineDiff.leftLineNumber ?? ""}
              </div>
              <div className={`flex-1 px-4 py-0.5 whitespace-pre ${getLineTextColor(lineDiff.type, true)}`}>
                {lineDiff.leftLine ?? "\u00A0"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="relative">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
          JSON RIGHT
        </div>
        <div
          ref={rightScrollRef}
          onScroll={handleRightScroll}
          className="max-h-[520px] overflow-auto font-mono text-sm leading-6"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          {lineDiffs.map((lineDiff, index) => (
            <div
              key={`right-${index}`}
              className={`flex border-l-2 ${getLineBorderColor(lineDiff.type)} ${getLineBgColor(lineDiff.type, false)}`}
            >
              <div className="flex-shrink-0 w-12 px-2 py-0.5 text-right text-xs text-slate-500 select-none bg-slate-900/50">
                {lineDiff.rightLineNumber ?? ""}
              </div>
              <div className={`flex-1 px-4 py-0.5 whitespace-pre ${getLineTextColor(lineDiff.type, false)}`}>
                {lineDiff.rightLine ?? "\u00A0"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JsonDiffView;

