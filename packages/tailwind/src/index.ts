import type { ThemeDefinition } from "@theme-kit/core";

export interface TailwindPluginOptions {
  themes?: readonly ThemeDefinition[];
  defaultTheme?: string;
}

export function createTailwindPlugin(options?: TailwindPluginOptions) {
  return {
    name: "@theme-kit/tailwind",
  };
}

export function synchronizeDarkClass(theme: { meta?: { mode?: string } }): void {
  if (typeof document === "undefined") return;
  const isDark = theme.meta?.mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

export const themeCSS = `/* Theme CSS is available at ./theme.css */`;
