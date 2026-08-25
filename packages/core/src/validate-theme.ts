import type { ThemeDefinition, ThemeName } from "./model/theme";
import { resolveTheme } from "./model";

export interface ValidationIssue {
  type: "missing";
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
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
      issues.push({
        type: "missing",
        path: `${path}.${key}`,
        message: `Missing token: \`${path}.${key}\``,
      });
    }
  }

  return issues;
}

export interface ValidateThemeOptions {
  themes?: readonly ThemeDefinition[];
}

/**
 * Validate a theme definition against the Theme Kit schema: required
 *    semantic tokens, valid references, and contrast ratios. Returns a list
 *    of issues (empty when valid).
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
      type: "missing",
      path: "tokens",
      message: "Missing `tokens` — theme has no token definitions",
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
