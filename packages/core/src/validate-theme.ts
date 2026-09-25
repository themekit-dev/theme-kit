import type { ThemeDefinition, ThemeName } from "./model/theme";
import { resolveTheme } from "./model";
import type { ThemeDiagnosticCode, ThemeDiagnosticContext } from "./diagnostics";

/**
 * A single problem found while validating a theme definition.
 */
export interface ValidationIssue {
  /**
   * Stable diagnostic code. Assert on this rather than on {@link message},
   * which may be reworded.
   */
  code: ThemeDiagnosticCode;
  /** The kind of issue. Currently always `"missing"` (a required token is absent). */
  type: "missing";
  /** Dot-separated path to the offending token, e.g. `"colors.primary"`. */
  path: string;
  /** Human-readable description of the issue. */
  message: string;
  /** Structured context, so a caller can act without parsing {@link message}. */
  context: ThemeDiagnosticContext;
}

/**
 * The outcome of validating a theme definition.
 */
export interface ValidationResult {
  /** `true` when no issues were found. */
  valid: boolean;
  /** Every issue found, empty when the theme is valid. */
  issues: ValidationIssue[];
}

const REQUIRED_COLOR_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "success",
  "successForeground",
  "border",
  "input",
  "ring",
] as const;

function collectMissing(
  obj: Record<string, unknown> | undefined,
  required: readonly string[],
  path: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const key of required) {
    if (obj?.[key] === undefined) {
      const tokenPath = `${path}.${key}`;
      issues.push({
        code: "TK_THEME_TOKEN_MISSING",
        type: "missing",
        path: tokenPath,
        message: `Missing token: \`${tokenPath}\``,
        context: {
          api: "validateTheme",
          property: key,
          path: tokenPath,
          expected: "a token value",
        },
      });
    }
  }

  return issues;
}

/**
 * Options for {@link validateTheme}.
 */
export interface ValidateThemeOptions {
  /**
   * Additional theme definitions used to resolve the target theme by name
   * before validation. When omitted, the theme is validated as-is.
   */
  themes?: readonly ThemeDefinition[];
}

/**
 * Validate a theme definition against the Theme Kit schema.
 *
 * Checks that the definition declares a `tokens` object and that every required
 * semantic colour token is present. It deliberately does **not** resolve token
 * references and does not check contrast: unresolved references are reported by
 * token resolution (which throws), and contrast has its own validator,
 * `validateThemeContrast`.
 *
 * Returns issues rather than throwing, so a caller can report every problem at
 * once — the CLI does exactly this.
 *
 * @param theme - The theme definition to validate.
 * @param options - Optional registry used to resolve the theme by name first.
 * @returns `{ valid, issues }`, where `valid` is `true` when `issues` is empty.
 *
 * @see {@link ValidationIssue}
 * @see {@link generateTheme}
 */
export function validateTheme(
  theme: ThemeDefinition,
  options: ValidateThemeOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];

  let target = theme;

  if (options.themes && theme.name) {
    try {
      target = resolveTheme(options.themes, theme.name as ThemeName);
    } catch {
      // validate definition as-is
    }
  }

  const tokens = target.tokens;

  if (!tokens) {
    issues.push({
      code: "TK_THEME_TOKEN_MISSING",
      type: "missing",
      path: "tokens",
      message: "Missing `tokens` — theme has no token definitions",
      context: {
        api: "validateTheme",
        property: "tokens",
        path: "tokens",
        expected: "a tokens object",
      },
    });
  } else {
    const colors = tokens.colors as Record<string, unknown> | undefined;
    issues.push(...collectMissing(colors, REQUIRED_COLOR_KEYS, "colors"));
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
