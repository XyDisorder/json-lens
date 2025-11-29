import type { JsonDiff } from "@/lib/jsonCompare";

export type LineDiff = {
  leftLine: string | null;
  rightLine: string | null;
  leftLineNumber: number | null;
  rightLineNumber: number | null;
  type: "added" | "removed" | "modified" | "unchanged" | "context";
  diff?: JsonDiff;
};

const formatJsonLines = (json: string): string[] => {
  return json.split("\n");
};

const findDiffForLine = (
  line: string,
  lineNumber: number,
  diffs: JsonDiff[],
  isLeft: boolean,
): JsonDiff | undefined => {
  // Try to match JSON key-value pairs: "key": value
  const keyMatch = line.match(/"([^"]+)"\s*:/);
  
  // Also try to match array values: "value" or value
  const arrayValueMatch = line.match(/^\s*"([^"]+)"\s*,?\s*$/);
  
  let bestMatch: JsonDiff | undefined = undefined;
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
    const pathParts = diff.path.split(".");
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if this is an array index
    const isArrayIndex = /^\d+$/.test(lastPart);
    
    if (keyMatch) {
      // This is a key-value pair
      const key = keyMatch[1];
      const nonNumericParts = pathParts.filter((k) => k !== "root" && !/^\d+$/.test(k));
      if (nonNumericParts.length === 0) continue;
      
      const lastKey = nonNumericParts[nonNumericParts.length - 1];
      if (lastKey === key) {
        // Prefer more specific matches (deeper paths)
        if (nonNumericParts.length > bestMatchDepth) {
          bestMatch = diff;
          bestMatchDepth = nonNumericParts.length;
        }
      }
    } else if (arrayValueMatch && isArrayIndex) {
      // This is an array value - check if the value matches
      const value = arrayValueMatch[1];
      const diffValue = isLeft ? diff.leftValue : diff.rightValue;
      
      // Compare the string value
      if (diffValue !== undefined) {
        // Normalize both values for comparison
        const normalizedLineValue = value;
        let normalizedDiffValue: string;
        if (typeof diffValue === "string") {
          normalizedDiffValue = diffValue;
        } else {
          normalizedDiffValue = JSON.stringify(diffValue).replace(/^"|"$/g, "");
        }
        
        if (normalizedLineValue === normalizedDiffValue) {
          // Prefer more specific matches (deeper paths)
          if (pathParts.length > bestMatchDepth) {
            bestMatch = diff;
            bestMatchDepth = pathParts.length;
          }
        }
      }
    }
  }
  
  return bestMatch;
};

export const computeLineDiffs = (
  leftJson: string,
  rightJson: string,
  diffs: JsonDiff[],
): LineDiff[] => {
  if (!leftJson && !rightJson) return [];
  if (!leftJson) {
    return formatJsonLines(rightJson).map((line, index) => ({
      leftLine: null,
      rightLine: line,
      leftLineNumber: null,
      rightLineNumber: index + 1,
      type: "added" as const,
    }));
  }
  if (!rightJson) {
    return formatJsonLines(leftJson).map((line, index) => ({
      leftLine: line,
      rightLine: null,
      leftLineNumber: index + 1,
      rightLineNumber: null,
      type: "removed" as const,
    }));
  }

  const leftLines = formatJsonLines(leftJson);
  const rightLines = formatJsonLines(rightJson);
  const result: LineDiff[] = [];

  // Créer un mapping des lignes avec leurs diffs
  const leftLineDiffs = leftLines.map((line, index) => ({
    line,
    lineNumber: index + 1,
    diff: findDiffForLine(line, index + 1, diffs, true),
  }));

  const rightLineDiffs = rightLines.map((line, index) => ({
    line,
    lineNumber: index + 1,
    diff: findDiffForLine(line, index + 1, diffs, false),
  }));

  // Aligner les lignes - approche simple : ligne par ligne
  const maxLines = Math.max(leftLines.length, rightLines.length);

  for (let i = 0; i < maxLines; i++) {
    const leftLine = leftLines[i];
    const rightLine = rightLines[i];
    const leftDiff = leftLineDiffs[i]?.diff;
    const rightDiff = rightLineDiffs[i]?.diff;

    if (leftLine === undefined && rightLine !== undefined) {
      // Ligne ajoutée à droite
      result.push({
        leftLine: null,
        rightLine,
        leftLineNumber: null,
        rightLineNumber: i + 1,
        type: "added",
        diff: rightDiff,
      });
    } else if (leftLine !== undefined && rightLine === undefined) {
      // Ligne supprimée à gauche
      result.push({
        leftLine,
        rightLine: null,
        leftLineNumber: i + 1,
        rightLineNumber: null,
        type: "removed",
        diff: leftDiff,
      });
    } else if (leftLine === rightLine) {
      // Ligne identique
      const diff = leftDiff || rightDiff;
      result.push({
        leftLine,
        rightLine,
        leftLineNumber: i + 1,
        rightLineNumber: i + 1,
        type: diff?.type === "unchanged" ? "unchanged" : "context",
        diff,
      });
    } else {
      // Ligne différente - utiliser le type de diff réel si disponible
      let type: LineDiff["type"] = "modified";
      let diff: JsonDiff | undefined = undefined;
      
      // Prioriser le diff de droite pour "added", le diff de gauche pour "removed"
      if (rightDiff && rightDiff.type === "added") {
        type = "added";
        diff = rightDiff;
      } else if (leftDiff && leftDiff.type === "removed") {
        type = "removed";
        diff = leftDiff;
      } else if (leftDiff && leftDiff.type === "modified") {
        type = "modified";
        diff = leftDiff;
      } else if (rightDiff && rightDiff.type === "modified") {
        type = "modified";
        diff = rightDiff;
      } else {
        // Pas de diff trouvé directement, mais vérifier si on peut inférer le type
        // Pour les valeurs de tableau, vérifier si c'est vraiment une modification ou une suppression/ajout
        const leftIsArrayValue = leftLine && /^\s*"[^"]+"\s*,?\s*$/.test(leftLine.trim());
        const rightIsArrayValue = rightLine && /^\s*"[^"]+"\s*,?\s*$/.test(rightLine.trim());
        
        // Chercher dans tous les diffs pour trouver un match basé sur la valeur
        if (leftIsArrayValue || rightIsArrayValue) {
          if (leftIsArrayValue && !rightIsArrayValue) {
            // Left has array value but right doesn't - check if it's a removed element
            const valueToMatch = leftLine.match(/^\s*"([^"]+)"\s*/)?.[1];
            if (valueToMatch) {
              for (const d of diffs) {
                if (d.type === "removed" && d.leftValue !== undefined) {
                  const normalizedDValue = typeof d.leftValue === "string" ? d.leftValue : JSON.stringify(d.leftValue).replace(/^"|"$/g, "");
                  if (normalizedDValue === valueToMatch) {
                    type = "removed";
                    diff = d;
                    break;
                  }
                }
              }
            }
          } else if (!leftIsArrayValue && rightIsArrayValue) {
            // Right has array value but left doesn't - check if it's an added element
            const valueToMatch = rightLine.match(/^\s*"([^"]+)"\s*/)?.[1];
            if (valueToMatch) {
              for (const d of diffs) {
                if (d.type === "added" && d.rightValue !== undefined) {
                  const normalizedDValue = typeof d.rightValue === "string" ? d.rightValue : JSON.stringify(d.rightValue).replace(/^"|"$/g, "");
                  if (normalizedDValue === valueToMatch) {
                    type = "added";
                    diff = d;
                    break;
                  }
                }
              }
            }
          }
        }
        
        // Si on n'a toujours pas trouvé, utiliser modified par défaut
        if (type === "modified" && !diff) {
          diff = leftDiff || rightDiff;
        }
      }
      
      result.push({
        leftLine,
        rightLine,
        leftLineNumber: i + 1,
        rightLineNumber: i + 1,
        type,
        diff,
      });
    }
  }

  return result;
};

