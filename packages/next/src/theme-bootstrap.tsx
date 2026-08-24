"use client";

import { useServerInsertedHTML } from "next/navigation";

import {
  resolveSelectionTheme,
  themeToCSSVariables,
  type InitialThemeResolution,
  type ThemeDefinition,
} from "@theme-kit/core";

export interface ThemeBootstrapProps<T extends ThemeDefinition> {
  themes: readonly T[];
  initial: InitialThemeResolution<T>;
}

function darkModeCSSTemplate(variables: Record<string, string>): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `@media (prefers-color-scheme: dark) {:root {\n${rules}\n}}`;
}

export function ThemeBootstrap<T extends ThemeDefinition>({
  themes,
  initial,
}: ThemeBootstrapProps<T>) {
  const { family, mode } = initial.selection;

  useServerInsertedHTML(() => {
    if (mode !== "system") return null;

    const dark = resolveSelectionTheme({
      themes,
      selection: { family, mode: "dark" },
    });

    const darkVariables = themeToCSSVariables(dark.theme);

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: darkModeCSSTemplate(darkVariables),
        }}
      />
    );
  });

  return null;
}
