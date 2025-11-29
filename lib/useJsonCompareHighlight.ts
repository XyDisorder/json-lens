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
    // For array indices, we need to match the actual line content, not just the key
    // So we keep numeric indices for array matching
    const pathParts = path.split(".").filter((k) => k !== "root");
    if (pathParts.length === 0) return;
    
    // If the last part is a numeric index, we need to match array elements differently
    const lastPart = pathParts[pathParts.length - 1];
    const isArrayIndex = /^\d+$/.test(lastPart);
    
    // For array indices, we can't match by key name, so we skip them
    // They will be matched by their position in the array
    if (isArrayIndex && pathParts.length === 1) {
      // Root level array - can't match by key
      return;
    }
    
    // Filter out numeric indices for key matching, but keep them for path context
    const keysOnly = pathParts.filter((k) => !/^\d+$/.test(k));
    if (keysOnly.length === 0) return;
    
    // Use the last key (most specific) for matching
    const lastKey = keysOnly[keysOnly.length - 1];
    const escapedKey = lastKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match the key as a JSON property (must be followed by colon)
    const regex = new RegExp(`"${escapedKey}"\\s*:`, "i");
    
    // Match all occurrences of this key in the text
    textLines.forEach((line, index) => {
      if (regex.test(line)) {
        lines.add(index);
      }
    });
  });

  return lines;
};

const getLineDiffType = (lineIndex: number, text: string, diffs: JsonDiff[], isLeft: boolean): JsonDiff["type"] | null => {
  const lines = text.split("\n");
  if (lineIndex >= lines.length) return null;

  const line = lines[lineIndex];
  
  // Find the most specific matching diff for this line
  let bestMatch: JsonDiff | null = null;
  let bestMatchDepth = -1;
  
  // Filter diffs that are relevant for this side
  const relevantDiffs = diffs.filter((diff) => {
    if (isLeft) {
      return diff.type === "removed" || diff.type === "modified";
    } else {
      return diff.type === "added" || diff.type === "modified";
    }
  });
  
  for (const diff of relevantDiffs) {
    const pathParts = diff.path.split(".").filter((k) => k !== "root" && !/^\d+$/.test(k));
    if (pathParts.length === 0) continue;
    
    // Use the last key (most specific) for matching
    const lastKey = pathParts[pathParts.length - 1];
    const escapedKey = lastKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match the key as a JSON property (must be followed by colon)
    const regex = new RegExp(`"${escapedKey}"\\s*:`, "i");
    
    if (regex.test(line)) {
      // Prefer more specific matches (deeper paths)
      // If same depth, prefer modified over added/removed (more specific change)
      // But always accept if we don't have a match yet
      const shouldUpdate = bestMatch === null || 
        pathParts.length > bestMatchDepth || 
        (pathParts.length === bestMatchDepth && 
         diff.type === "modified" && 
         bestMatch && bestMatch.type !== "modified");
      
      if (shouldUpdate) {
        bestMatch = diff;
        bestMatchDepth = pathParts.length;
      }
    }
  }
  
  return bestMatch ? bestMatch.type : null;
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
    // Only highlight lines with actual changes (not unchanged)
    const paths = diffs
      .filter((d) => (isLeft ? d.type === "removed" || d.type === "modified" : d.type === "added" || d.type === "modified"))
      .map((d) => d.path);
    return getLinesToHighlight(text, paths);
  }, [text, diffs, isLeft]);

  const segments = useMemo(() => createLineSegments(text, highlightLines, diffs, isLeft), [text, highlightLines, diffs, isLeft]);

  return { highlightLines, segments };
};

export type { LineSegment };

