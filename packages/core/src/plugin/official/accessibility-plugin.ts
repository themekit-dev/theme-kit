import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";
import { validateThemeContrast, type ContrastCheck } from "../../accessibility/contrast";

export interface AccessibilityPluginOptions {
  level?: "AA" | "AAA";
  warnOnly?: boolean;
  onViolation?: (result: { themeName: string; checks: ContrastCheck[] }) => void;
}

export function createAccessibilityPlugin<T extends ThemeDefinition>(
  options?: AccessibilityPluginOptions,
): ThemePlugin<T> {
  const warnOnly = options?.warnOnly ?? true;

  return {
    name: "accessibility",
    version: "1.0.0",
    priority: 50,

    onAfterThemeChange({ theme }) {
      const result = validateThemeContrast(theme);
      const failed = result.checks.filter((c) => !c.passesAANormal);
      if (!result.valid && failed.length > 0) {
        const message = `[theme-kit] Theme "${theme.name}" has ${failed.length} contrast violation(s) at WCAG AA`;
        if (warnOnly) {
          console.warn(message, failed);
        } else {
          console.error(message, failed);
        }
        options?.onViolation?.({ themeName: theme.name, checks: failed });
      }
    },
  };
}
