import { defineTheme } from "@theme-kit/core";

/**
 * A theme family is one definition per mode: `meta.family` groups them and
 * `meta.mode` says which mode each one serves. The runtime resolves a
 * family + mode selection to one of these names.
 */
export const baseLight = defineTheme({
  name: "base-light",
  meta: { family: "base", mode: "light", label: "Base Light" },
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f8fafc",
      cardForeground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      border: "#e2e8f0",
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
      card: "#111c33",
      cardForeground: "#e2e8f0",
      muted: "#172036",
      mutedForeground: "#94a3b8",
      primary: "#60a5fa",
      primaryForeground: "#0b1120",
      border: "#1e293b",
    },
  },
});

/** `as const` lets the provider infer the family and mode literals. */
export const themes = [baseLight, baseDark] as const;
