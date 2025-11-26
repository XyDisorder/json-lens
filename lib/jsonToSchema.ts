import type { JsonValue } from "@/lib/treeBuilder";

export type SchemaNode = {
  key?: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  children?: SchemaNode[];
};

const isPlainObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const primitiveType = (
  value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>,
): SchemaNode["type"] => {
  if (value === null) return "null";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "null";
  }
};

export const jsonToSchema = (value: JsonValue, key?: string): SchemaNode => {
  if (Array.isArray(value)) {
    return {
      key,
      type: "array",
      children: value.map((item, index) => jsonToSchema(item, index.toString())),
    };
  }

  if (isPlainObject(value)) {
    return {
      key,
      type: "object",
      children: Object.entries(value).map(([childKey, childValue]) => jsonToSchema(childValue, childKey)),
    };
  }

  return { key, type: primitiveType(value as Exclude<typeof value, JsonValue[] | { [key: string]: JsonValue }>) };
};
