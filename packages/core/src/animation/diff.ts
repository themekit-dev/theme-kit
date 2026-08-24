import type { ThemeDiff } from "./types";
import { EMPTY_THEME_DIFF } from "./types";

/**
 * CSS variable prefixes each token group materializes to (see `themeToCSSVariables`).
 */
export const GROUP_VAR_PREFIXES: Record<keyof ThemeDiff, string[]> = {
  colors: ["--theme-color-"],
  radius: ["--theme-radius-"],
  spacing: ["--theme-spacing-"],
  typography: ["--theme-typography-"],
  shadows: ["--theme-shadow-"],
  borders: ["--theme-border-width-"],
  layout: ["--theme-z-index-", "--theme-breakpoint-"],
  transforms: [],
};

/**
 * Rebuild the per-group variable prefixes for a custom CSS-variable prefix
 * (e.g. a `ThemeScope` with `prefix: "checkout-"` produces `--checkout-color-*`).
 */
function buildVarPrefixes(
  prefix: string | undefined,
): Record<keyof ThemeDiff, string[]> {
  if (prefix === undefined || prefix === "" || prefix === "theme-") {
    return GROUP_VAR_PREFIXES;
  }
  const dash = prefix.endsWith("-") ? prefix : `${prefix}-`;
  const base = `--${dash}`;
  return {
    colors: [`${base}color-`],
    radius: [`${base}radius-`],
    spacing: [`${base}spacing-`],
    typography: [`${base}typography-`],
    shadows: [`${base}shadow-`],
    borders: [`${base}border-width-`],
    layout: [`${base}z-index-`, `${base}breakpoint-`],
    transforms: [],
  };
}

function groupChanged(
  prev: Map<string, string>,
  next: Record<string, string>,
  prefixes: string[],
): boolean {
  if (prefixes.length === 0) return false;

  const keys = new Set<string>();
  for (const prefix of prefixes) {
    for (const key of prev.keys()) {
      if (key.startsWith(prefix)) keys.add(key);
    }
    for (const key of Object.keys(next)) {
      if (key.startsWith(prefix)) keys.add(key);
    }
  }
  for (const key of keys) {
    if (prev.get(key) !== next[key]) return true;
  }
  return false;
}

/**
 * Theme Diff Engine.
 *
 * Compares the previously applied CSS variables against the incoming theme's
 * variables per token group. Comparing the *final resolved values* (rather than
 * raw theme definitions) means two themes that resolve to identical colors
 * produce no diff — and nothing animates.
 */
export function createThemeDiff(
  prev: Map<string, string> | null | undefined,
  next: Record<string, string>,
  prefix?: string,
): ThemeDiff {
  // The very first apply is a baseline, not a change: an empty previous map
  // would otherwise look like "every group was just added" and trigger an
  // animation on boot. Treat it as no-change so the initial state applies
  // instantly.
  if (!prev || prev.size === 0) {
    return { ...EMPTY_THEME_DIFF };
  }
  const prefixes = buildVarPrefixes(prefix);
  const diff: ThemeDiff = { ...EMPTY_THEME_DIFF };
  for (const group of Object.keys(GROUP_VAR_PREFIXES) as (keyof ThemeDiff)[]) {
    if (groupChanged(prev, next, prefixes[group])) {
      diff[group] = true;
    }
  }
  return diff;
}
