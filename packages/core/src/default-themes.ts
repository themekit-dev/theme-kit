import { defineTheme } from "./model";

type Family = {
  family: string;
  label: string;
  primary: string;
  accent: string;
  radius: string;
};

const families: Family[] = [
  {
    family: "oat",
    label: "Oat",
    primary: "#d97706",
    accent: "#f59e0b",
    radius: "16px",
  },
  {
    family: "berry",
    label: "Berry",
    primary: "#db2777",
    accent: "#ec4899",
    radius: "16px",
  },
  {
    family: "mint",
    label: "Mint",
    primary: "#059669",
    accent: "#10b981",
    radius: "18px",
  },
  {
    family: "citrus",
    label: "Citrus",
    primary: "#d97706",
    accent: "#fb923c",
    radius: "18px",
  },
  {
    family: "cocoa",
    label: "Cocoa",
    primary: "#92400e",
    accent: "#b45309",
    radius: "14px",
  },
  {
    family: "plum",
    label: "Plum",
    primary: "#7c3aed",
    accent: "#8b5cf6",
    radius: "18px",
  },
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function makeTheme(family: Family, mode: "light" | "dark") {
  const isLight = mode === "light";

  return defineTheme({
    name: `${family.family}-${mode}` as const,
    meta: {
      family: family.family,
      mode,
      label: `${family.label} ${capitalize(mode)}`,
      order: isLight ? 10 : 20,
    },
    tokens: {
      colors: {
        background: isLight ? "#f8fafc" : "#020617",
        foreground: isLight ? "#0f172a" : "#f8fafc",

        card: isLight ? "#ffffff" : "#0f172a",
        cardForeground: isLight ? "#0f172a" : "#f8fafc",

        popover: isLight ? "#ffffff" : "#0f172a",
        popoverForeground: isLight ? "#0f172a" : "#f8fafc",

        primary: family.primary,
        primaryForeground: "#ffffff",

        secondary: isLight ? "#e2e8f0" : "#1e293b",
        secondaryForeground: isLight ? "#0f172a" : "#f8fafc",

        muted: isLight ? "#e2e8f0" : "#1e293b",
        mutedForeground: isLight ? "#475569" : "#94a3b8",

        accent: family.accent,
        accentForeground: "#ffffff",

        destructive: isLight ? "#ef4444" : "#f87171",
        destructiveForeground: "#ffffff",

        border: isLight ? "#e2e8f0" : "#334155",
        input: isLight ? "#e2e8f0" : "#334155",
        ring: family.primary,
      },
      radius: {
        lg: family.radius,
      },
    },
  });
}

export function getDefaultThemes() {
  return families.flatMap((family) => [
    makeTheme(family, "light"),
    makeTheme(family, "dark"),
  ]);
}
