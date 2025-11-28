import type { JsonValue } from "@/lib/treeBuilder";

export type DiffType = "added" | "removed" | "modified" | "unchanged";

export type JsonDiff = {
  path: string;
  type: DiffType;
  leftValue?: JsonValue;
  rightValue?: JsonValue;
};

const isPlainObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const compareValues = (
  left: JsonValue | undefined,
  right: JsonValue | undefined,
  path: string,
  diffs: JsonDiff[],
): void => {
  // Both undefined/null
  if (left === undefined && right === undefined) return;

  // Added
  if (left === undefined && right !== undefined) {
    diffs.push({ path, type: "added", rightValue: right });
    return;
  }

  // Removed
  if (left !== undefined && right === undefined) {
    diffs.push({ path, type: "removed", leftValue: left });
    return;
  }

  // Both defined - compare types
  if (left === null && right === null) {
    diffs.push({ path, type: "unchanged", leftValue: null, rightValue: null });
    return;
  }

  if (left === null || right === null) {
    diffs.push({ path, type: "modified", leftValue: left, rightValue: right });
    return;
  }

  // Compare primitives
  if (typeof left !== "object" || typeof right !== "object") {
    if (left === right) {
      diffs.push({ path, type: "unchanged", leftValue: left, rightValue: right });
    } else {
      diffs.push({ path, type: "modified", leftValue: left, rightValue: right });
    }
    return;
  }

  // Both arrays
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    for (let i = 0; i < maxLength; i++) {
      compareValues(left[i], right[i], `${path}.${i}`, diffs);
    }
    return;
  }

  // Both objects
  if (isPlainObject(left) && isPlainObject(right)) {
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of allKeys) {
      compareValues(left[key], right[key], path === "root" ? key : `${path}.${key}`, diffs);
    }
    return;
  }

  // Type mismatch
  diffs.push({ path, type: "modified", leftValue: left, rightValue: right });
};

export const compareJson = (left: JsonValue, right: JsonValue): JsonDiff[] => {
  const diffs: JsonDiff[] = [];
  compareValues(left, right, "root", diffs);
  return diffs;
};

