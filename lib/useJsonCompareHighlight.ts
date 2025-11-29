import { useMemo } from "react";
import type { JsonDiff } from "@/lib/jsonCompare";

type LineSegment = {
  text: string;
  highlight: boolean;
  type: JsonDiff["type"] | null;
  isLastLine: boolean;
};

const getLinesToHighlight = (text: string, paths: string[]): Set<number> => {
  const lines = new Set<number>();
  if (!text) return lines;

  const textLines = text.split("\n");
  paths.forEach((path) => {
    const keys = path.split(".").filter((k) => k !== "root" && !/^\d+$/.test(k));
    keys.forEach((key) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`"${escapedKey}"\\s*:`, "i");
      textLines.forEach((line, index) => {
        if (regex.test(line)) {
          lines.add(index);
        }
      });
    });
  });

  return lines;
};

const getLineDiffType = (lineIndex: number, text: string, diffs: JsonDiff[], isLeft: boolean): JsonDiff["type"] | null => {
  const lines = text.split("\n");
  if (lineIndex >= lines.length) return null;

  const line = lines[lineIndex];
  for (const diff of diffs) {
    const keys = diff.path.split(".").filter((k) => k !== "root" && !/^\d+$/.test(k));
    for (const key of keys) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`"${escapedKey}"\\s*:`, "i");
      if (regex.test(line)) {
        if (isLeft && (diff.type === "removed" || diff.type === "modified" || diff.type === "unchanged")) {
          return diff.type;
        }
        if (!isLeft && (diff.type === "added" || diff.type === "modified" || diff.type === "unchanged")) {
          return diff.type;
        }
      }
    }
  }
  return null;
};

const createLineSegments = (text: string, highlightLines: Set<number>, diffs: JsonDiff[], isLeft: boolean): LineSegment[] => {
  if (!text) return [];
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const shouldHighlight = highlightLines.has(index);
    const diffType = shouldHighlight ? getLineDiffType(index, text, diffs, isLeft) : null;
    return {
      text: line,
      highlight: shouldHighlight,
      type: diffType,
      isLastLine: index === lines.length - 1,
    };
  });
};

export const useJsonCompareHighlight = (text: string, diffs: JsonDiff[], isLeft: boolean) => {
  const highlightLines = useMemo(() => {
    if (!text || !diffs.length) return new Set<number>();
    const paths = diffs
      .filter((d) => (isLeft ? d.type === "removed" || d.type === "modified" || d.type === "unchanged" : d.type === "added" || d.type === "modified" || d.type === "unchanged"))
      .map((d) => d.path);
    return getLinesToHighlight(text, paths);
  }, [text, diffs, isLeft]);

  const segments = useMemo(() => createLineSegments(text, highlightLines, diffs, isLeft), [text, highlightLines, diffs, isLeft]);

  return { highlightLines, segments };
};

export type { LineSegment };

