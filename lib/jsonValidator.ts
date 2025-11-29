import type { JsonValue } from "@/lib/treeBuilder";

export type ValidationResult = {
  valid: boolean;
  value?: JsonValue;
  error?: string;
};

export const validateJson = (text: string): ValidationResult => {
  if (!text.trim()) {
    return { valid: false, error: "Empty input" };
  }

  try {
    const parsed = JSON.parse(text) as JsonValue;
    return { valid: true, value: parsed };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
};

export const formatJson = (text: string): ValidationResult => {
  const validation = validateJson(text);
  if (!validation.valid || !validation.value) {
    return validation;
  }

  try {
    const formatted = JSON.stringify(validation.value, null, 2);
    return { valid: true, value: validation.value };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Failed to format JSON",
    };
  }
};

