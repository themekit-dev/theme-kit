import type { ThemeDefinition } from "@theme-kit/core";

export function computeFingerprint(
  themes: readonly ThemeDefinition[],
  defaultTheme?: string,
): string {
  if (!themes.length) return "";
  const names = themes.map((t) => t.name).sort().join(",");
  return `${defaultTheme ?? ""}|${names}`;
}
