import { defineTheme } from "@theme-kit/core";

/**
 * Two families so a scoped region can be visibly pinned to a different theme
 * than the page. Each family is one definition per mode, grouped by
 * `meta.family`.
 */
export const baseLight = defineTheme({
  name: "base-light",
  meta: { family: "base", mode: "light", label: "Base Light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#2563eb",
      primaryForeground: "#ffffff",
    },
  },
});

export const baseDark = defineTheme({
  name: "base-dark",
  meta: { family: "base", mode: "dark", label: "Base Dark" },
  tokens: {
    colors: {
      background: "#0b1120",
      foreground: "#e2e8f0",
      primary: "#60a5fa",
      primaryForeground: "#0b1120",
    },
  },
});

export const plumLight = defineTheme({
  name: "plum-light",
  meta: { family: "plum", mode: "light", label: "Plum Light" },
  tokens: {
    colors: {
      background: "#faf5ff",
      foreground: "#2e1065",
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
    },
  },
});

export const plumDark = defineTheme({
  name: "plum-dark",
  meta: { family: "plum", mode: "dark", label: "Plum Dark" },
  tokens: {
    colors: {
      background: "#1e1b4b",
      foreground: "#ede9fe",
      primary: "#c4b5fd",
      primaryForeground: "#1e1b4b",
    },
  },
});

export const themes = [baseLight, baseDark, plumLight, plumDark] as const;
