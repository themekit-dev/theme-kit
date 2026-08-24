import type { ThemeTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "./source";

type RecordMap = Record<string, unknown>;

function asRecord(value: unknown): RecordMap | undefined {
  return value && typeof value === "object"
    ? (value as RecordMap)
    : undefined;
}

export function readNested(
  record: RecordMap | undefined,
  path: string,
): unknown {
  if (!record) return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    const current = asRecord(acc);
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return undefined;
  }, record);
}

function camelize(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function kebabize(value: string): string {
  return value.replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`);
}

/**
 * Reads a color from resolved tokens. Accepts nested paths
 * (`primary.main`) and matches camelCase / kebab-case variants so both
 * `primaryForeground` and `primary-foreground` token keys work.
 */
export function readColor(
  theme: AdapterResolvedTheme,
  key: string,
  fallback?: string,
): string | undefined {
  const colors = asRecord(theme.tokens.colors);
  const direct = readNested(colors, key);
  if (typeof direct === "string") return direct;

  const variants = new Set<string>();
  variants.add(camelize(key).replace(/\./g, "-"));
  variants.add(kebabize(key));

  for (const variant of variants) {
    if (variant === key) continue;
    const value = readNested(colors, variant);
    if (typeof value === "string") return value;
  }

  return fallback;
}

export function readToken(
  theme: AdapterResolvedTheme,
  category: keyof ThemeTokens,
  key: string,
  fallback?: string,
): string | undefined {
  const section = asRecord(theme.tokens[category]);
  const value = readNested(section, key);
  return typeof value === "string" ? value : fallback;
}

export function readFontFamily(
  tokens: ThemeTokens | undefined,
  fallback = "system-ui, sans-serif",
  preferred?: string,
): string {
  const families = asRecord(tokens?.typography?.fontFamilies);
  if (!families) return fallback;
  if (preferred) {
    const value = families[preferred];
    if (typeof value === "string") return value;
  }
  for (const key of ["sans", "body", "ui", "heading"]) {
    const value = families[key];
    if (typeof value === "string") return value;
  }
  const first = Object.values(families)[0];
  return typeof first === "string" ? first : fallback;
}

export function readFontSize(
  tokens: ThemeTokens | undefined,
  key = "md",
  fallback = "0.875rem",
): string {
  const sizes = asRecord(tokens?.typography?.fontSizes);
  const value = readNested(sizes, key);
  return typeof value === "string" ? value : fallback;
}

export function readRadiusNumber(
  theme: AdapterResolvedTheme,
  key = "lg",
  fallback = 8,
): number {
  const value = readToken(theme, "radius", key);
  if (!value) return fallback;
  const trimmed = value.trim();
  const px = /^([\d.]+)px$/.exec(trimmed);
  if (px) return Number(px[1]);
  const rem = /^([\d.]+)rem$/.exec(trimmed);
  if (rem) return Math.round(Number(rem[1]) * 16);
  const em = /^([\d.]+)em$/.exec(trimmed);
  if (em) return Math.round(Number(em[1]) * 16);
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : fallback;
}

export function readRadius(
  theme: AdapterResolvedTheme,
  key = "lg",
  fallback = "0.5rem",
): string {
  return readToken(theme, "radius", key, fallback) ?? fallback;
}

export function readBreakpoints(
  tokens: ThemeTokens | undefined,
  fallback: Record<string, string> = {},
): Record<string, string> {
  const breakpoints = asRecord(tokens?.breakpoints);
  if (!breakpoints) return fallback;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(breakpoints)) {
    if (typeof value === "string") result[key] = value;
  }
  return Object.keys(result).length > 0 ? result : fallback;
}