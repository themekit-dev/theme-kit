import type { ThemeTokens } from "@theme-kit/core";
import type { AdapterResolvedTheme } from "./source";

type RecordMap = Record<string, unknown>;

function asRecord(value: unknown): RecordMap | undefined {
  return value && typeof value === "object"
    ? (value as RecordMap)
    : undefined;
}

/**
 * Reads a value from a nested record using a dot-separated path
 * (`"primary.main"`). Returns `undefined` when the record is missing or any
 * segment along the path is absent.
 *
 * @param record The record to read from, or `undefined`.
 * @param path A dot-separated key path, e.g. `"primary.main"`.
 * @returns The value at the path, or `undefined` if not found.
 *
 * @see {@link readToken}
 */
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

/**
 * Reads a string token from a resolved theme's token group.
 *
 * The token is looked up by a dot-separated path within the given category
 * (e.g. `readToken(theme, "colors", "primary.main")`). Non-string values and
 * missing keys fall back to `fallback`.
 *
 * @param theme The resolved theme to read from.
 * @param category The token group to read from (e.g. `"colors"`, `"radius"`).
 * @param key A dot-separated key path within the category.
 * @param fallback The value returned when the token is missing or not a string.
 * @returns The string token value, or `fallback`.
 *
 * @see {@link readNested}
 */
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

/**
 * Resolves a font family from the theme's `typography.fontFamilies` tokens.
 *
 * When `preferred` is given and resolves to a string it wins; otherwise the
 * first of `sans`, `body`, `ui`, `heading` that resolves is used, then the
 * first family in the group, and finally `fallback`.
 *
 * @param tokens The theme's resolved tokens, or `undefined`.
 * @param fallback The value returned when no family resolves. Defaults to
 *   `"system-ui, sans-serif"`.
 * @param preferred An optional family key to prefer over the built-in order.
 * @returns A resolved font family string.
 *
 * @see {@link readToken}
 */
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

/**
 * Reads a font size from the theme's `typography.fontSizes` tokens.
 *
 * @param tokens The theme's resolved tokens, or `undefined`.
 * @param key The font-size key to read. Defaults to `"md"`.
 * @param fallback The value returned when the key is missing or not a string.
 *   Defaults to `"0.875rem"`.
 * @returns The font-size string, or `fallback`.
 *
 * @see {@link readToken}
 */
export function readFontSize(
  tokens: ThemeTokens | undefined,
  key = "md",
  fallback = "0.875rem",
): string {
  const sizes = asRecord(tokens?.typography?.fontSizes);
  const value = readNested(sizes, key);
  return typeof value === "string" ? value : fallback;
}

/**
 * Reads a radius token and converts it to a pixel number.
 *
 * Accepts `px`, `rem` and `em` units (rem/em are multiplied by 16) as well as
 * bare numbers. Unparseable or missing values return `fallback`.
 *
 * @param theme The resolved theme to read from.
 * @param key The radius key to read. Defaults to `"lg"`.
 * @param fallback The value returned when the token is missing or unparseable.
 *   Defaults to `8`.
 * @returns The radius in pixels.
 *
 * @see {@link readRadius}
 */
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

/**
 * Reads a radius token as its raw string value.
 *
 * @param theme The resolved theme to read from.
 * @param key The radius key to read. Defaults to `"lg"`.
 * @param fallback The value returned when the token is missing. Defaults to
 *   `"0.5rem"`.
 * @returns The radius string, or `fallback`.
 *
 * @see {@link readRadiusNumber}
 */
export function readRadius(
  theme: AdapterResolvedTheme,
  key = "lg",
  fallback = "0.5rem",
): string {
  return readToken(theme, "radius", key, fallback) ?? fallback;
}

/**
 * Reads the theme's breakpoints as a map of name to CSS value.
 *
 * Only string-valued entries are kept. When no breakpoints resolve, `fallback`
 * is returned unchanged.
 *
 * @param tokens The theme's resolved tokens, or `undefined`.
 * @param fallback The map returned when no breakpoints resolve. Defaults to
 *   `{}`.
 * @returns A map of breakpoint name to value.
 */
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