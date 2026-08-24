import type { ThemeDefinition } from "../model/theme";
import { resolveTheme } from "../model";
import type { ThemeName } from "../model/theme";

export interface ContrastCheck {
  foregroundToken: string;
  backgroundToken: string;
  foreground: string;
  background: string;
  ratio: number;
  passesAANormal: boolean;
  passesAALarge: boolean;
  passesAAANormal: boolean;
  passesAAALarge: boolean;
}

export interface ValidateThemeContrastOptions {
  themes?: readonly ThemeDefinition[];
}

export interface ContrastValidationResult {
  valid: boolean;
  checks: ContrastCheck[];
}

const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;
const WCAG_AAA_NORMAL = 7.0;
const WCAG_AAA_LARGE = 4.5;

function getLuminance(hex: string): number {
  const clean = hex.replace(/^#/, "");
  if (clean.length < 6) return 0;

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(foreground: string, background: string): number {
  const fg = getLuminance(foreground);
  const bg = getLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

/** @internal */
export function checkContrastPair(
  foreground: string,
  background: string,
): Omit<ContrastCheck, "foregroundToken" | "backgroundToken"> {
  const ratio = getContrastRatio(foreground, background);
  return {
    foreground,
    background,
    ratio,
    passesAANormal: ratio >= WCAG_AA_NORMAL,
    passesAALarge: ratio >= WCAG_AA_LARGE,
    passesAAANormal: ratio >= WCAG_AAA_NORMAL,
    passesAAALarge: ratio >= WCAG_AAA_LARGE,
  };
}

const SEMANTIC_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["cardForeground", "card"],
  ["popoverForeground", "popover"],
  ["primaryForeground", "primary"],
  ["secondaryForeground", "secondary"],
  ["mutedForeground", "muted"],
  ["accentForeground", "accent"],
  ["destructiveForeground", "destructive"],
];

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/.test(value);
}

export function validateThemeContrast(
  theme: ThemeDefinition,
  options: ValidateThemeContrastOptions = {},
): ContrastValidationResult {
  let target = theme;

  if (options.themes && theme.name) {
    try {
      target = resolveTheme(options.themes, theme.name as ThemeName);
    } catch {
      // validate definition as-is
    }
  }

  const colors = target.tokens?.colors as Record<string, string | undefined> | undefined;
  const checks: ContrastCheck[] = [];

  if (!colors) {
    return { valid: true, checks: [] };
  }

  for (const [fgToken, bgToken] of SEMANTIC_PAIRS) {
    const fg = colors[fgToken];
    const bg = colors[bgToken];

    if (typeof fg !== "string" || typeof bg !== "string") continue;
    if (!isHexColor(fg) || !isHexColor(bg)) continue;

    const check = checkContrastPair(fg, bg);
    checks.push({
      ...check,
      foregroundToken: fgToken,
      backgroundToken: bgToken,
    });
  }

  const valid = checks.every((c) => c.passesAANormal);

  return { valid, checks };
}
