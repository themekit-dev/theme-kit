import type { ThemeDefinition } from "@theme-kit/core";

/**
 * Fingerprint the theme configuration so stale cookies from an older build
 * (different themes / default) are ignored instead of being applied against
 * themes they were never valid for.
 *
 * Mirrors `@theme-kit/next`'s `computeFingerprint` so both SSR integrations
 * agree on the same cookie contract.
 */
export function computeFingerprint(
  themes: readonly ThemeDefinition[],
  defaultTheme?: string,
): string {
  if (!themes.length) return "";
  const names = themes.map((t) => t.name).sort().join(",");
  return `${defaultTheme ?? ""}|${names}`;
}