import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";
import { validateThemeContrast, type ContrastCheck } from "../../accessibility/contrast";
import { createDiagnostic, emitDiagnostic } from "../../diagnostics";

/**
 * Options for {@link createAccessibilityPlugin}.
 */
export interface AccessibilityPluginOptions {
  /** Target WCAG contrast level. */
  level?: "AA" | "AAA";
  /** When `true`, contrast violations are reported at warning level; when
   *  `false`, they are reported at error level. Default `true`. */
  warnOnly?: boolean;
  /** Invoked with the theme name and failing contrast checks whenever a
   *  contrast violation is detected. */
  onViolation?: (result: { themeName: string; checks: ContrastCheck[] }) => void;
}

/**
 * Creates a plugin that validates theme contrast for accessibility.
 *
 * The plugin runs a WCAG contrast check on the active theme after every theme
 * change and reports any violations that fail AA normal contrast, either by
 * emitting a `TK_A11Y_CONTRAST_VIOLATION` diagnostic or by invoking the
 * `onViolation` callback.
 *
 * @param options - Accessibility configuration.
 * @returns An `"accessibility"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createAccessibilityPlugin({
 *   warnOnly: true,
 *   onViolation: ({ themeName, checks }) => report(themeName, checks),
 * }));
 * ```
 *
 * @remarks
 * Violations are reported only when the theme fails AA normal contrast and at
 * least one check fails. `warnOnly` chooses the diagnostic's level. The failing
 * checks travel as the diagnostic's structured context, so they stay available
 * to the console and to any consumer of the diagnostics stream rather than
 * being flattened into the message.
 *
 * @see {@link AccessibilityPluginOptions}
 */
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
        emitDiagnostic(
          createDiagnostic({
            code: "TK_A11Y_CONTRAST_VIOLATION",
            level: warnOnly ? "warning" : "error",
            message:
              `Theme "${theme.name}" has ${failed.length} contrast ` +
              `violation${failed.length === 1 ? "" : "s"} at WCAG AA.`,
            context: {
              api: "createAccessibilityPlugin",
              property: "contrast",
              received: theme.name,
              expected: "WCAG AA normal contrast",
              details: failed,
            },
            hint:
              "Adjust the failing colour pair, or call validateThemeContrast() " +
              "directly to inspect every pair that was checked.",
          }),
        );
        options?.onViolation?.({ themeName: theme.name, checks: failed });
      }
    },
  };
}
