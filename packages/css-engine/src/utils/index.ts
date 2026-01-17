/**
 * Combines non-null/non-empty parts into a single string with a separator
 * @param parts - Array of string or null values to combine
 * @param separator - Separator to use between parts
 * @returns Combined string with only truthy values
 */
export function combine(parts: (string | null)[], separator: string): string {
  return parts.filter(Boolean).join(separator);
}

export * from "./types";
