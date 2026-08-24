import { defineTheme } from "./model";

export function getHighContrastTheme(mode: "light" | "dark") {
  const isLight = mode === "light";
  return defineTheme({
    name: `high-contrast-${mode}` as const,
    meta: {
      mode,
      label: isLight ? "High Contrast Light" : "High Contrast Dark",
      tags: ["accessibility", "high-contrast"],
      order: isLight ? 30 : 40,
    },
    tokens: {
      colors: {
        background: isLight ? "#ffffff" : "#000000",
        foreground: isLight ? "#000000" : "#ffffff",
        card: isLight ? "#ffffff" : "#000000",
        cardForeground: isLight ? "#000000" : "#ffffff",
        popover: isLight ? "#ffffff" : "#000000",
        popoverForeground: isLight ? "#000000" : "#ffffff",
        primary: isLight ? "#0000ee" : "#4488ff",
        primaryForeground: isLight ? "#ffffff" : "#000000",
        secondary: isLight ? "#e0e0e0" : "#333333",
        secondaryForeground: isLight ? "#000000" : "#ffffff",
        muted: isLight ? "#e0e0e0" : "#333333",
        mutedForeground: isLight ? "#111111" : "#eeeeee",
        accent: isLight ? "#0000ee" : "#4488ff",
        accentForeground: isLight ? "#ffffff" : "#000000",
        destructive: isLight ? "#cc0000" : "#ff4444",
        destructiveForeground: "#ffffff",
        success: isLight ? "#008000" : "#44cc44",
        successForeground: "#ffffff",
        border: "#000000",
        input: "#000000",
        ring: isLight ? "#0000ee" : "#4488ff",
      },
      radius: {
        lg: "4px",
      },
    },
  });
}

export function getLargeTextTheme(mode: "light" | "dark") {
  const isLight = mode === "light";
  return defineTheme({
    name: `large-text-${mode}` as const,
    meta: {
      mode,
      label: isLight ? "Large Text Light" : "Large Text Dark",
      tags: ["accessibility", "large-text"],
      order: isLight ? 35 : 45,
    },
    tokens: {
      colors: {
        background: isLight ? "#fafafa" : "#0a0a0a",
        foreground: isLight ? "#000000" : "#f0f0f0",
        card: isLight ? "#ffffff" : "#111111",
        cardForeground: isLight ? "#000000" : "#f0f0f0",
        popover: isLight ? "#ffffff" : "#111111",
        popoverForeground: isLight ? "#000000" : "#f0f0f0",
        primary: isLight ? "#0055cc" : "#4488ff",
        primaryForeground: "#ffffff",
        secondary: isLight ? "#e8e8e8" : "#2a2a2a",
        secondaryForeground: isLight ? "#000000" : "#f0f0f0",
        muted: isLight ? "#e8e8e8" : "#2a2a2a",
        mutedForeground: isLight ? "#333333" : "#cccccc",
        accent: isLight ? "#0055cc" : "#4488ff",
        accentForeground: "#ffffff",
        destructive: isLight ? "#cc0000" : "#ff4444",
        destructiveForeground: "#ffffff",
        success: isLight ? "#008000" : "#44cc44",
        successForeground: "#ffffff",
        border: isLight ? "#cccccc" : "#444444",
        input: isLight ? "#cccccc" : "#444444",
        ring: isLight ? "#0055cc" : "#4488ff",
      },
      radius: {
        lg: "8px",
      },
      typography: {
        fontSizes: {
          xs: "1rem",
          sm: "1.125rem",
          base: "1.25rem",
          lg: "1.5rem",
          xl: "1.875rem",
          "2xl": "2.25rem",
          "3xl": "3rem",
          "4xl": "3.75rem",
          "5xl": "4.5rem",
          "6xl": "6rem",
        },
        lineHeights: {
          tight: "1.4",
          normal: "1.8",
          relaxed: "2.0",
        },
        fontFamilies: {
          sans: "system-ui, sans-serif",
          mono: "monospace",
        },
      },
    },
  });
}

export function getAccessibilityProfiles() {
  return [
    getHighContrastTheme("light"),
    getHighContrastTheme("dark"),
    getLargeTextTheme("light"),
    getLargeTextTheme("dark"),
  ];
}