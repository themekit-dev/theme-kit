import { defineTheme } from "./model";
import {
  mergePresetTokens,
  type PresetOverrides,
  type PresetVariantOverride,
} from "./presets";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Every preset is a curated, WCAG-conscious token set for both modes:
 *
 * - `primaryForeground` is picked per palette so buttons stay readable (a
 *   bright primary in dark mode gets a dark foreground instead of white).
 * - `mutedForeground` is a dimmer-but-still-readable body/comment color.
 * - `accent` is the shared surface for `secondary`, `muted` and `accent`;
 *   `accentForeground` is the text that reads well on it.
 */
type ModePalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  mutedForeground: string;
  border: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
};

type Palette = {
  family:
    | "oat"
    | "berry"
    | "mint"
    | "citrus"
    | "cocoa"
    | "plum"
    | "iris"
    | "sky"
    | "graphite";
  label: string;
  light: ModePalette;
  dark: ModePalette;
  radius: string;
};

function makeTheme(
  palette: Palette,
  mode: "light" | "dark",
  override?: PresetVariantOverride,
) {
  const base = mode === "light" ? palette.light : palette.dark;

  const tokens = mergePresetTokens(
    {
      colors: {
        background: base.background,
        foreground: base.foreground,
        card: base.card,
        cardForeground: base.cardForeground,
        popover: base.card,
        popoverForeground: base.cardForeground,
        primary: base.primary,
        primaryForeground: base.primaryForeground,
        secondary: base.accent,
        secondaryForeground: base.accentForeground,
        muted: base.accent,
        mutedForeground: base.mutedForeground,
        accent: base.accent,
        accentForeground: base.accentForeground,
        destructive: base.destructive,
        destructiveForeground: base.destructiveForeground,
        success: base.success,
        successForeground: base.successForeground,
        border: base.border,
        input: base.border,
        ring: base.ring,
      },
      radius: {
        lg: palette.radius,
      },
    },
    override?.tokens,
  );

  return defineTheme({
    name: `${palette.family}-${mode}` as const,
    meta: {
      family: palette.family,
      mode,
      label: `${palette.label} ${capitalize(mode)}`,
      order: mode === "light" ? 10 : 20,
    },
    tokens,
  });
}

const palettes: Palette[] = [
  {
    family: "oat",
    label: "Oat",
    light: {
      background: "#fbf7f1",
      foreground: "#3a2b1c",
      card: "#ffffff",
      cardForeground: "#3a2b1c",
      primary: "#b45309",
      primaryForeground: "#fffaf0",
      accent: "#f4e8d7",
      accentForeground: "#7a4a12",
      mutedForeground: "#71604b",
      border: "#e7d8c4",
      ring: "#b45309",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#171109",
      foreground: "#f6efe5",
      card: "#1e1710",
      cardForeground: "#f6efe5",
      primary: "#e9aa66",
      primaryForeground: "#2a1a09",
      accent: "#2c2215",
      accentForeground: "#eacba5",
      mutedForeground: "#a99a87",
      border: "#433320",
      ring: "#e9aa66",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "12px",
  },
  {
    family: "berry",
    label: "Berry",
    light: {
      background: "#fdf4f7",
      foreground: "#46142a",
      card: "#ffffff",
      cardForeground: "#46142a",
      primary: "#be185d",
      primaryForeground: "#ffffff",
      accent: "#fce7ef",
      accentForeground: "#9d1350",
      mutedForeground: "#7c5a6a",
      border: "#f3d1de",
      ring: "#be185d",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#1f1218",
      foreground: "#fceef4",
      card: "#271721",
      cardForeground: "#fceef4",
      primary: "#f472b6",
      primaryForeground: "#2a0b1c",
      accent: "#34202b",
      accentForeground: "#f5c1d8",
      mutedForeground: "#bd9dab",
      border: "#472e3c",
      ring: "#f472b6",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "16px",
  },
  {
    family: "mint",
    label: "Mint",
    light: {
      background: "#f3faf6",
      foreground: "#0f2f21",
      card: "#ffffff",
      cardForeground: "#0f2f21",
      primary: "#0b8154",
      primaryForeground: "#ffffff",
      accent: "#dcefe4",
      accentForeground: "#0b6547",
      mutedForeground: "#42695a",
      border: "#cce7d6",
      ring: "#0b8154",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#0a1912",
      foreground: "#e9f7ef",
      card: "#0f2419",
      cardForeground: "#e9f7ef",
      primary: "#2fbf80",
      primaryForeground: "#05281a",
      accent: "#173327",
      accentForeground: "#8fd6b4",
      mutedForeground: "#87a998",
      border: "#1f4a34",
      ring: "#2fbf80",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "18px",
  },
  {
    family: "citrus",
    label: "Citrus",
    light: {
      background: "#fdfaf0",
      foreground: "#3d2f0e",
      card: "#ffffff",
      cardForeground: "#3d2f0e",
      primary: "#d97706",
      primaryForeground: "#3b2100",
      accent: "#fbeecb",
      accentForeground: "#85500a",
      mutedForeground: "#6b5f3c",
      border: "#ecddab",
      ring: "#d97706",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#1b1506",
      foreground: "#fcf3d9",
      card: "#241d0b",
      cardForeground: "#fcf3d9",
      primary: "#fbbf24",
      primaryForeground: "#3a2500",
      accent: "#33280f",
      accentForeground: "#f3db9a",
      mutedForeground: "#c2ad7e",
      border: "#51401b",
      ring: "#fbbf24",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "18px",
  },
  {
    family: "cocoa",
    label: "Cocoa",
    light: {
      background: "#f8f3ee",
      foreground: "#2c1e15",
      card: "#ffffff",
      cardForeground: "#2c1e15",
      primary: "#92400e",
      primaryForeground: "#fff8ef",
      accent: "#ecdfd2",
      accentForeground: "#6b3d1a",
      mutedForeground: "#6f6254",
      border: "#ddcec0",
      ring: "#92400e",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#17110c",
      foreground: "#f5ede4",
      card: "#1f1812",
      cardForeground: "#f5ede4",
      primary: "#c9976b",
      primaryForeground: "#2a1a0e",
      accent: "#2a1f16",
      accentForeground: "#e5c5a8",
      mutedForeground: "#a49381",
      border: "#443829",
      ring: "#c9976b",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "14px",
  },
  {
    family: "plum",
    label: "Plum",
    light: {
      background: "#f8f6fd",
      foreground: "#322561",
      card: "#ffffff",
      cardForeground: "#322561",
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      accent: "#ede8fb",
      accentForeground: "#5a2ba6",
      mutedForeground: "#6b6390",
      border: "#ddd5f1",
      ring: "#7c3aed",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#1b1430",
      foreground: "#efeaf9",
      card: "#231a3d",
      cardForeground: "#efeaf9",
      primary: "#a78bfa",
      primaryForeground: "#231540",
      accent: "#2d2348",
      accentForeground: "#cec2f7",
      mutedForeground: "#a79cc8",
      border: "#443a68",
      ring: "#a78bfa",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "18px",
  },
  {
    family: "iris",
    label: "Iris",
    light: {
      background: "#f6f7fe",
      foreground: "#23295c",
      card: "#ffffff",
      cardForeground: "#23295c",
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      accent: "#e2e6fc",
      accentForeground: "#3831a8",
      mutedForeground: "#4a5180",
      border: "#d6dbef",
      ring: "#4f46e5",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#141831",
      foreground: "#e9ebfa",
      card: "#1b2040",
      cardForeground: "#e9ebfa",
      primary: "#818cf8",
      primaryForeground: "#1a1f45",
      accent: "#232a58",
      accentForeground: "#c5ccfe",
      mutedForeground: "#9aa2cf",
      border: "#2e3773",
      ring: "#818cf8",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "16px",
  },
  {
    family: "sky",
    label: "Sky",
    light: {
      background: "#f3f8fe",
      foreground: "#16314f",
      card: "#ffffff",
      cardForeground: "#16314f",
      primary: "#0369a1",
      primaryForeground: "#ffffff",
      accent: "#dcebf9",
      accentForeground: "#075985",
      mutedForeground: "#45627d",
      border: "#cbddef",
      ring: "#0369a1",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#0c1d2f",
      foreground: "#e7f1fb",
      card: "#12283f",
      cardForeground: "#e7f1fb",
      primary: "#38bdf8",
      primaryForeground: "#08202e",
      accent: "#14304d",
      accentForeground: "#a7d8fa",
      mutedForeground: "#92aabb",
      border: "#204564",
      ring: "#38bdf8",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "18px",
  },
  {
    family: "graphite",
    label: "Graphite",
    light: {
      background: "#f7f8fa",
      foreground: "#1b2027",
      card: "#ffffff",
      cardForeground: "#1b2027",
      primary: "#4a5568",
      primaryForeground: "#ffffff",
      accent: "#e6eaf0",
      accentForeground: "#2d3748",
      mutedForeground: "#525d6b",
      border: "#d8dee6",
      ring: "#4a5568",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
        success: "#16a34a",
        successForeground: "#ffffff",
},
    dark: {
      background: "#14171d",
      foreground: "#ebeef2",
      card: "#1b1f27",
      cardForeground: "#ebeef2",
      primary: "#94a3b8",
      primaryForeground: "#17191f",
      accent: "#20252e",
      accentForeground: "#c6ccd6",
      mutedForeground: "#9aa3af",
      border: "#2c333d",
      ring: "#94a3b8",
      destructive: "#f87171",
      destructiveForeground: "#2b0e0e",
        success: "#4ade80",
        successForeground: "#020617",
},
    radius: "14px",
  },
];

export function getPresetThemes(overrides?: PresetOverrides) {
  return palettes.flatMap((palette) => [
    makeTheme(palette, "light", overrides?.[palette.family]?.light),
    makeTheme(palette, "dark", overrides?.[palette.family]?.dark),
  ]);
}
