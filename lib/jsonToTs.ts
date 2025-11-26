import type { JsonValue } from "@/lib/treeBuilder";

const isPlainObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toPascalCase = (segments: string[]): string => {
  const collapsed = segments
    .map((segment) =>
      segment
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(""),
    )
    .join("");

  const fallback = collapsed.length === 0 ? "Root" : collapsed;
  return /^[A-Za-z_]/.test(fallback.charAt(0)) ? fallback : `Type${fallback}`;
};

type DefinitionMap = Map<string, string>;

const buildObjectDefinition = (
  value: { [key: string]: JsonValue },
  path: string[],
  definitions: DefinitionMap,
): string => {
  const typeName = toPascalCase(path);

  if (definitions.has(typeName)) {
    return typeName;
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    definitions.set(typeName, `type ${typeName} = Record<string, never>;`);
    return typeName;
  }

  const fields = entries
    .map(([key, child]) => `  ${key}: ${inferType(child, [...path, key], definitions)};`)
    .join("\n");

  definitions.set(typeName, `type ${typeName} = {\n${fields}\n};`);

  return typeName;
};

const inferPrimitive = (value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>): string => {
  if (value === null) return "null";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "never";
  }
};

const inferType = (value: JsonValue, path: string[], definitions: DefinitionMap): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Array<never>";
    }

    const childTypes = Array.from(
      new Set(value.map((item) => inferType(item, [...path, "Item"], definitions))),
    ).sort();

    return `Array<${childTypes.join(" | ")}>`;
  }

  if (isPlainObject(value)) {
    return buildObjectDefinition(value, path, definitions);
  }

  return inferPrimitive(value as Exclude<typeof value, JsonValue[] | { [key: string]: JsonValue }>);
};

export const jsonToTs = (value: JsonValue): string => {
  const definitions: DefinitionMap = new Map();
  const rootType = inferType(value, ["Root"], definitions);

  if (!definitions.has("Root")) {
    definitions.set("Root", `type Root = ${rootType};`);
  } else {
    definitions.set("Root", definitions.get("Root") ?? `type Root = ${rootType};`);
  }

  const ordered = Array.from(definitions.entries()).sort((a, b) => {
    if (a[0] === "Root") return -1;
    if (b[0] === "Root") return 1;
    return a[0].localeCompare(b[0]);
  });

  return ordered.map(([, definition]) => definition).join("\n\n");
};
