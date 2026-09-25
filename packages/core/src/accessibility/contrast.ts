import type { ThemeDefinition } from "../model/theme";
import { resolveTheme } from "../model";
import type { ThemeName } from "../model/theme";

/**
 * The result of a single foreground/background contrast check.
 */
export interface ContrastCheck {
  /** The foreground token name checked. */
  foregroundToken: string;
  /** The background token name checked. */
  backgroundToken: string;
  /** The resolved foreground color. */
  foreground: string;
  /** The resolved background color. */
  background: string;
  /** The WCAG contrast ratio (1 to 21). */
  ratio: number;
  /** Whether the pair meets WCAG AA for normal text (ratio ≥ 4.5). */
  passesAANormal: boolean;
  /** Whether the pair meets WCAG AA for large text (ratio ≥ 3.0). */
  passesAALarge: boolean;
  /** Whether the pair meets WCAG AAA for normal text (ratio ≥ 7.0). */
  passesAAANormal: boolean;
  /** Whether the pair meets WCAG AAA for large text (ratio ≥ 4.5). */
  passesAAALarge: boolean;
}

/**
 * Options for {@link validateThemeContrast}.
 */
export interface ValidateThemeContrastOptions {
  /**
   * Additional theme definitions used to resolve the target theme by name
   * before checking. When omitted, the theme is checked as-is.
   */
  themes?: readonly ThemeDefinition[];
}

/**
 * The outcome of validating a theme's color contrast.
 */
export interface ContrastValidationResult {
  /** `true` when every checked pair passes WCAG AA for normal text. */
  valid: boolean;
  /** The per-pair contrast checks performed. */
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

/**
 * Compute the WCAG contrast ratio between two colors.
 *
 * The ratio is `(L1 + 0.05) / (L2 + 0.05)` where `L1`/`L2` are the relative
 * luminances of the lighter and darker colors, yielding a value in the range
 * 1 (identical colors) to 21 (black on white). Colors are parsed as hex.
 *
 * @param foreground The foreground color (hex).
 * @param background The background color (hex).
 * @returns The contrast ratio, a number between 1 and 21.
 * @see {@link validateThemeContrast}
 */
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

/**
 * Validate a theme's semantic color pairs against WCAG contrast thresholds.
 *
 * Checks the standard foreground/background pairs (e.g. `foreground` on
 * `background`, `primaryForeground` on `primary`) and reports each pair's
 * ratio and whether it passes WCAG AA/AAA for normal and large text. Pairs
 * whose colors are missing or not hex are skipped. The theme is considered
 * valid when every checked pair passes WCAG AA for normal text.
 *
 * @param theme The theme definition to check.
 * @param options Optional configuration.
 * @returns A {@link ContrastValidationResult} with per-pair checks.
 * @see {@link getContrastRatio}
 */
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
