import type { JsonValue } from "@/lib/treeBuilder";

const isPlainObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const collectPaths = (value: JsonValue, currentPath = "root"): string[] => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [currentPath];
    }

    return value.flatMap((item, index) => collectPaths(item, `${currentPath}.${index}`));
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return [currentPath];
    }

    return entries.flatMap(([key, child]) => collectPaths(child, `${currentPath}.${key}`));
  }

  return [currentPath];
};

export const jsonToPaths = (value: JsonValue): string[] => collectPaths(value);
