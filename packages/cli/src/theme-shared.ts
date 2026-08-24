import type { ThemeDefinition } from "@theme-kit/core";
import { readFileSync } from "node:fs";

/**
 * A `generateTheme` result: two complete themes keyed by mode.
 * `generate --mode both` writes exactly this shape.
 */
export interface ThemePair {
  light: ThemeDefinition;
  dark: ThemeDefinition;
}

export function isThemePair(value: unknown): value is ThemePair {
  return (
    typeof value === "object" &&
    value !== null &&
    "light" in value &&
    "dark" in value
  );
}

export function isThemeDefinition(value: unknown): value is ThemeDefinition {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { tokens?: unknown }).tokens !== undefined
  );
}

export function readThemeJSON(file: string): unknown {
  let content: string;
  try {
    content = readFileSync(file, "utf-8");
  } catch {
    throw new Error(`cannot read file ${file}`);
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`file is not valid JSON: ${file}`);
  }
}

/**
 * Normalises the two shapes the CLI can read into a flat list of themes:
 * a single `ThemeDefinition`, or a `{ light, dark }` pair produced by
 * `generate --mode both`.
 */
export function toThemes(value: unknown): ThemeDefinition[] {
  if (isThemePair(value)) return [value.light, value.dark];
  if (isThemeDefinition(value)) return [value];
  throw new Error(
    "root must be a theme object or a { light, dark } pair (use generate --mode light|dark for a single theme)",
  );
}

export function themeName(theme: ThemeDefinition): string {
  return (theme.name ?? "unnamed") as string;
}