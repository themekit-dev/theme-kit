import { getContrastRatio, type ThemeDefinition } from "@theme-kit/core";

/**
 * Color helpers shared by the preset previews and the landing-page card.
 *
 * These started life inside `components/preset-preview.tsx`. The landing hero
 * needs the same maths (it reports the live theme's measured contrast), so they
 * live here rather than being copied — two implementations of WCAG luminance
 * that can drift is exactly the kind of thing this documentation site exists to
 * argue against.
 */

export type Colors = Record<string, string>;

export function colorsOf(theme: ThemeDefinition): Colors {
  return (theme.tokens?.colors ?? {}) as Colors;
}

export function c(colors: Colors, key: string, fallback: string): string {
  return colors[key] ?? fallback;
}

const HEX6 = /^#?[0-9a-f]{6}$/i;

/**
 * WCAG 2.x contrast ratio between two `#rrggbb` colors, or `null` when either
 * value is not a plain 6-digit hex.
 *
 * The maths is `getContrastRatio` from `@theme-kit/core` — the same function the
 * package ships — so the documentation cannot drift from the thing it
 * documents. The guard around it is ours: token sets contain `rgba()` values
 * (the selection and highlight tints), and those should be skipped rather than
 * guessed at, which is what returning `null` signals to the callers.
 */
export function contrastRatio(fg: string, bg: string): number | null {
  if (!HEX6.test(fg.trim()) || !HEX6.test(bg.trim())) return null;
  const ratio = getContrastRatio(fg, bg);
  return Number.isFinite(ratio) ? ratio : null;
}
