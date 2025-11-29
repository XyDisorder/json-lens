import type { JsonDiff } from "./jsonCompare";

type KeyOccurrence = {
  key: string;
  fullPath: string;
  lineIndex: number;
  value: string;
};

const findKeyOccurrences = (text: string): KeyOccurrence[] => {
  const occurrences: KeyOccurrence[] = [];
  if (!text) return occurrences;

  const lines = text.split("\n");
  const pathStack: Array<{ key: string; indent: number }> = [];

  lines.forEach((line, lineIndex) => {
    // Match JSON key-value pairs: "key": value
    const keyMatch = line.match(/^(\s*)"([^"]+)"\s*:\s*(.+?)(,?\s*)$/);
    if (keyMatch) {
      const indent = keyMatch[1].length;
      const key = keyMatch[2];
      const value = keyMatch[3].trim();
      
      // Pop path stack until we find matching indent level
      while (pathStack.length > 0 && pathStack[pathStack.length - 1].indent >= indent) {
        pathStack.pop();
      }
      
      // Build full path
      const pathParts = pathStack.map((p) => p.key);
      pathParts.push(key);
      const fullPath = pathParts.join(".");
      
      // Push current key to stack
      pathStack.push({ key, indent });
      
      occurrences.push({
        key,
        fullPath,
        lineIndex,
        value,
      });
    }
  });

  return occurrences;
};

const compareKeyOccurrences = (
  leftOccurrences: KeyOccurrence[],
  rightOccurrences: KeyOccurrence[],
): JsonDiff[] => {
  const diffs: JsonDiff[] = [];
  
  // Group occurrences by full path and key
  const leftByKey = new Map<string, KeyOccurrence[]>();
  const rightByKey = new Map<string, KeyOccurrence[]>();
  
  leftOccurrences.forEach((occ) => {
    if (!leftByKey.has(occ.fullPath)) {
      leftByKey.set(occ.fullPath, []);
    }
    leftByKey.get(occ.fullPath)!.push(occ);
  });
  
  rightOccurrences.forEach((occ) => {
    if (!rightByKey.has(occ.fullPath)) {
      rightByKey.set(occ.fullPath, []);
    }
    rightByKey.get(occ.fullPath)!.push(occ);
  });
  
  // Compare occurrences for each full path
  const allPaths = new Set([...leftByKey.keys(), ...rightByKey.keys()]);
  
  allPaths.forEach((fullPath) => {
    const leftOccs = leftByKey.get(fullPath) || [];
    const rightOccs = rightByKey.get(fullPath) || [];
    
    const leftCount = leftOccs.length;
    const rightCount = rightOccs.length;
    
    if (leftCount > rightCount) {
      // More occurrences on left - mark extra ones as "removed" (they're missing on right)
      const extra = leftCount - rightCount;
      for (let i = 0; i < extra; i++) {
        const occ = leftOccs[rightCount + i];
        diffs.push({
          path: fullPath,
          type: "removed",
          leftValue: occ.value as any,
        });
      }
    } else if (rightCount > leftCount) {
      // More occurrences on right - mark extra ones as "added"
      const extra = rightCount - leftCount;
      for (let i = 0; i < extra; i++) {
        const occ = rightOccs[leftCount + i];
        diffs.push({
          path: fullPath,
          type: "added",
          rightValue: occ.value as any,
        });
      }
    }
  });
  
  return diffs;
};

export const compareJsonText = (leftText: string, rightText: string): JsonDiff[] => {
  const leftOccurrences = findKeyOccurrences(leftText);
  const rightOccurrences = findKeyOccurrences(rightText);
  
  return compareKeyOccurrences(leftOccurrences, rightOccurrences);
};

export type { KeyOccurrence };

