export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type TreeNode = {
  key: string;
  path: string;
  type: "object" | "array" | "primitive";
  value?: JsonPrimitive;
  children: TreeNode[];
};

const isPlainObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const buildTree = (value: JsonValue, path = ""): TreeNode => {
  const normalizedPath = path === "" ? "root" : path;
  const key = normalizedPath === "root" ? "root" : normalizedPath.split(".").pop() ?? "root";

  if (Array.isArray(value)) {
    return {
      key,
      path: normalizedPath,
      type: "array",
      children: value.map((item, index) => buildTree(item, `${normalizedPath}.${index}`)),
    };
  }

  if (isPlainObject(value)) {
    return {
      key,
      path: normalizedPath,
      type: "object",
      children: Object.entries(value).map(([childKey, childValue]) =>
        buildTree(childValue, `${normalizedPath}.${childKey}`),
      ),
    };
  }

  return {
    key,
    path: normalizedPath,
    type: "primitive",
    value: value as JsonPrimitive,
    children: [],
  };
};
