import { defineTheme } from "./model";

type Brand = {
  family: string;
  label: string;
  light: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    border: string;
    ring: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
  };
  dark: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    border: string;
    ring: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
  };
  radius: string;
};

const brands: Brand[] = [
  {
    family: "apple",
    label: "Apple",
    light: {
      background: "#f5f5f7",
      foreground: "#1d1d1f",
      primary: "#0071e3",
      accent: "#86868b",
      border: "#d2d2d7",
      ring: "#0071e3",
      card: "#ffffff",
      cardForeground: "#1d1d1f",
      muted: "#f5f5f7",
      mutedForeground: "#86868b",
    },
    dark: {
      background: "#000000",
      foreground: "#f5f5f7",
      primary: "#0a84ff",
      accent: "#98989d",
      border: "#38383a",
      ring: "#0a84ff",
      card: "#1c1c1e",
      cardForeground: "#f5f5f7",
      muted: "#2c2c2e",
      mutedForeground: "#98989d",
    },
    radius: "14px",
  },
  {
    family: "github",
    label: "GitHub",
    light: {
      background: "#ffffff",
      foreground: "#1f2328",
      primary: "#24292f",
      accent: "#ddf4ff",
      border: "#d0d7de",
      ring: "#0969da",
      card: "#ffffff",
      cardForeground: "#1f2328",
      muted: "#f6f8fa",
      mutedForeground: "#656d76",
    },
    dark: {
      background: "#0d1117",
      foreground: "#c9d1d9",
      primary: "#e6edf3",
      accent: "#1f3a5f",
      border: "#30363d",
      ring: "#58a6ff",
      card: "#161b22",
      cardForeground: "#c9d1d9",
      muted: "#1c2128",
      mutedForeground: "#8b949e",
    },
    radius: "6px",
  },
  {
    family: "vercel",
    label: "Vercel",
    light: {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#000000",
      accent: "#fafafa",
      border: "#eaeaea",
      ring: "#000000",
      card: "#ffffff",
      cardForeground: "#000000",
      muted: "#fafafa",
      mutedForeground: "#737373",
    },
    dark: {
      background: "#000000",
      foreground: "#ffffff",
      primary: "#ffffff",
      accent: "#1a1a1a",
      border: "#262626",
      ring: "#ffffff",
      card: "#0a0a0a",
      cardForeground: "#ffffff",
      muted: "#1a1a1a",
      mutedForeground: "#a3a3a3",
    },
    radius: "12px",
  },
  {
    family: "slack",
    label: "Slack",
    light: {
      background: "#ffffff",
      foreground: "#1d1c1d",
      primary: "#e01e5a",
      accent: "#f5f3f4",
      border: "#e0e0e0",
      ring: "#e01e5a",
      card: "#ffffff",
      cardForeground: "#1d1c1d",
      muted: "#f5f3f4",
      mutedForeground: "#6b6a6a",
    },
    dark: {
      background: "#1d1c1d",
      foreground: "#e0e0e0",
      primary: "#e01e5a",
      accent: "#16a34a",
      border: "#4d4c4d",
      ring: "#e01e5a",
      card: "#2c2c2c",
      cardForeground: "#e0e0e0",
      muted: "#3d3c3d",
      mutedForeground: "#9d9c9c",
    },
    radius: "12px",
  },
  {
    family: "discord",
    label: "Discord",
    light: {
      background: "#ffffff",
      foreground: "#040405",
      primary: "#5865f2",
      accent: "#f0f0ff",
      border: "#e3e3e3",
      ring: "#5865f2",
      card: "#ffffff",
      cardForeground: "#040405",
      muted: "#f2f2f3",
      mutedForeground: "#999ba4",
    },
    dark: {
      background: "#2c2f33",
      foreground: "#dcddde",
      primary: "#5865f2",
      accent: "#4f545c",
      border: "#40444b",
      ring: "#5865f2",
      card: "#36393f",
      cardForeground: "#dcddde",
      muted: "#2f3136",
      mutedForeground: "#b9bbbe",
    },
    radius: "16px",
  },
];

function makeTheme(
  brand: Brand,
  mode: "light" | "dark",
) {
  const base = mode === "light" ? brand.light : brand.dark;

  return defineTheme({
    name: `${brand.family}-${mode}` as const,
    meta: {
      family: brand.family,
      mode,
      label: `${brand.label} ${mode === "light" ? "Light" : "Dark"}`,
      order: mode === "light" ? 10 : 20,
    },
    tokens: {
      colors: {
        background: base.background,
        foreground: base.foreground,
        card: base.card,
        cardForeground: base.cardForeground,
        popover: base.card,
        popoverForeground: base.cardForeground,
        primary: base.primary,
        primaryForeground: mode === "light" ? "#ffffff" : "#000000",
        secondary: base.accent,
        secondaryForeground: base.foreground,
        muted: base.muted,
        mutedForeground: base.mutedForeground,
        accent: base.accent,
        accentForeground: base.foreground,
        destructive: mode === "light" ? "#ef4444" : "#f87171",
        destructiveForeground: mode === "light" ? "#ffffff" : "#000000",
        success: mode === "light" ? "#16a34a" : "#4ade80",
        successForeground: mode === "light" ? "#ffffff" : "#000000",
        border: base.border,
        input: base.border,
        ring: base.ring,
      },
      radius: {
        lg: brand.radius,
      },
    },
  });
}

export function getBrandPresets() {
  return brands.flatMap((brand) => [
    makeTheme(brand, "light"),
    makeTheme(brand, "dark"),
  ]);
}