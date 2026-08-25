import { defineTheme, type ThemeDefinition, type CodeTokens } from "./model";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = Number.parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s * (1 - amount), clamp(l + amount * 0.5, 0, 1));
}

function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, clamp(l - amount * 0.5, 0, 1));
}

function desaturate(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, clamp(s * (1 - amount), 0, 1), l);
}

function shiftHue(hex: string, degrees: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(((h + degrees) % 360 + 360) % 360, s, l);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Picks an on-color for a brand color: white when the color is dark enough,
 * otherwise a near-black ink. Keeps generated themes accessible and modern
 * regardless of the seed's lightness (e.g. white text never sits on amber).
 */
function contrastForeground(hex: string, darkInk: string): string {
  return relativeLuminance(hex) > 0.3 ? darkInk : "#ffffff";
}

export interface GenerateThemeOptions {
  seed: string;
  family?: string;
  /**
   * Also generate a `tokens.code` block (syntax-highlighting colors) alongside
   * the color tokens. Opt-in — most themes don't need code tokens.
   */
  withCode?: boolean;
}

export interface GeneratedThemePair {
  light: ThemeDefinition;
  dark: ThemeDefinition;
}

/**
 * Generate a cohesive syntax-highlighting palette from the seed hue.
 * Light and dark variants are distinguishable so code blocks invert with the
 * theme, and the syntax roles (keyword/string/number/…) are spread around the
 * hue wheel so they stay readable against the mode's background.
 */
function generateCodeTokens(
  mode: "light" | "dark",
  h: number,
  s: number,
  seed: string,
): CodeTokens {
  const bg = mode === "light" ? "#ffffff" : "#0f172a";
  const fg = mode === "light" ? "#0f172a" : "#e2e8f0";
  const muted = mode === "light" ? "#64748b" : "#94a3b8";

  const pick = (hueShift: number, sat: number, light: number) =>
    hslToHex((h + hueShift) % 360, clamp(sat, 0, 1), light);

  return {
    background: bg,
    foreground: fg,
    border: mode === "light" ? "#e2e8f0" : "#1e293b",
    comment: muted,
    keyword: mode === "light" ? pick(0, s * 0.9, 0.42) : pick(0, s * 0.8, 0.75),
    string: mode === "light" ? pick(130, s * 0.7, 0.38) : pick(130, s * 0.6, 0.68),
    number: mode === "light" ? pick(25, s * 0.8, 0.45) : pick(25, s * 0.8, 0.75),
    function: mode === "light" ? pick(240, s * 0.6, 0.4) : pick(240, s * 0.6, 0.72),
    variable: fg,
    type: mode === "light" ? pick(180, s * 0.6, 0.35) : pick(180, s * 0.6, 0.7),
    property: fg,
    operator: fg,
    punctuation: mode === "light" ? "#475569" : "#cbd5e1",
    tag: mode === "light" ? pick(0, s * 0.9, 0.4) : pick(0, s * 0.8, 0.75),
    attribute: mode === "light" ? pick(90, s * 0.7, 0.4) : pick(90, s * 0.6, 0.7),
    lineNumber: muted,
    selection: seed + "4d",
    highlight: mode === "light" ? "#f1f5f9" : "#1e293b",
    gutter: mode === "light" ? "#f8fafc" : "#020617",
  };
}

export function generateTheme(options: GenerateThemeOptions): GeneratedThemePair {
  const seed = options.seed;
  const family = options.family ?? "generated";
  const name = options.family ?? "generated";

  const [h, s, _l] = hexToHsl(seed);

  const lightTokens: ThemeDefinition["tokens"] = {
    colors: {
      background: "#f8fafc",
      foreground: "#0f172a",
      card: "#ffffff",
      cardForeground: "#0f172a",
      popover: "#ffffff",
      popoverForeground: "#0f172a",
      primary: seed,
      primaryForeground: contrastForeground(seed, "#0f172a"),
      secondary: hslToHex(h, clamp(s * 0.4, 0, 1), 0.92),
      secondaryForeground: "#0f172a",
      muted: hslToHex(h, clamp(s * 0.3, 0, 1), 0.95),
      mutedForeground: "#64748b",
      accent: hslToHex(h, clamp(s * 0.6, 0, 1), 0.85),
      accentForeground: "#0f172a",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      success: "#22c55e",
      successForeground: "#ffffff",
      border: hslToHex(h, clamp(s * 0.3, 0, 1), 0.88),
      input: hslToHex(h, clamp(s * 0.3, 0, 1), 0.88),
      ring: seed,
    },
    radius: {
      lg: "8px",
    },
  };
  if (options.withCode) {
    lightTokens.code = generateCodeTokens("light", h, s, seed);
  }

  const light: ThemeDefinition = defineTheme({
    name: `${name}-light`,
    meta: {
      family,
      mode: "light",
      label: `${family.charAt(0).toUpperCase() + family.slice(1)} Light`,
      order: 10,
    },
    tokens: lightTokens,
  });

  const darkTokens: ThemeDefinition["tokens"] = {
    colors: {
      background: "#020617",
      foreground: "#f8fafc",
      card: "#0f172a",
      cardForeground: "#f8fafc",
      popover: "#0f172a",
      popoverForeground: "#f8fafc",
      primary: hslToHex(h, clamp(s * 0.8, 0, 1), 0.75),
      primaryForeground: contrastForeground(
        hslToHex(h, clamp(s * 0.8, 0, 1), 0.75),
        "#020617",
      ),
      secondary: hslToHex(h, s, 0.15),
      secondaryForeground: "#f8fafc",
      muted: hslToHex(h, s, 0.12),
      mutedForeground: "#94a3b8",
      accent: hslToHex(h, clamp(s * 0.7, 0, 1), 0.2),
      accentForeground: "#f8fafc",
      destructive: "#f87171",
      destructiveForeground: "#020617",
      success: "#4ade80",
      successForeground: "#020617",
      border: hslToHex(h, s, 0.2),
      input: hslToHex(h, s, 0.2),
      ring: hslToHex(h, clamp(s * 0.8, 0, 1), 0.75),
    },
    radius: {
      lg: "8px",
    },
  };
  if (options.withCode) {
    darkTokens.code = generateCodeTokens("dark", h, s, seed);
  }

  const dark: ThemeDefinition = defineTheme({
    name: `${name}-dark`,
    meta: {
      family,
      mode: "dark",
      label: `${family.charAt(0).toUpperCase() + family.slice(1)} Dark`,
      order: 20,
    },
    tokens: darkTokens,
  });

  return { light, dark };
}
