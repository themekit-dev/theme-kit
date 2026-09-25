/**
 * Theme Kit web components — framework-free theming for any app.
 *
 * Provides the custom elements `ThemeKitProvider`, `ThemeKitScope`,
 * `ThemeKitToggle`, `ThemeKitSelect`, `ThemeKitScrollbar`, and
 * `ThemeKitInspector`, plus the `useTheme*` hooks, `getProviderRuntime`,
 * `getThemeSchedule`, and the `defineCustomElements` registration helper.
 *
 * @packageDocumentation
 */
import { ThemeKitProvider } from "./provider";
import { ThemeKitScope } from "./scope";
import { ThemeKitToggle } from "./toggle";
import { ThemeKitSelect } from "./select";
import { ThemeKitScrollbar } from "./scrollbar";
import { ThemeKitInspector } from "./inspector";
import { findProviderRuntime } from "./utils";

export { ThemeKitProvider } from "./provider";
export { getProviderRuntime } from "./utils";
export { ThemeKitScope } from "./scope";
export { ThemeKitToggle } from "./toggle";
export { ThemeKitSelect } from "./select";
export { ThemeKitScrollbar, injectPrePaintScrollbarCSS } from "./scrollbar";
export { ThemeKitInspector } from "./inspector";
export type { ThemeKitProviderProps } from "./provider";

export { PRE_PAINT_SCROLLBAR_CSS } from "@theme-kit/core";

/**
 * Resolves the active Theme Kit runtime from the first `<theme-kit-provider>`
 * element in the document.
 *
 * Framework-free (vanilla JS). Must be called after a `<theme-kit-provider>`
 * has initialized.
 *
 * @returns The provider's runtime.
 * @throws {Error} When no initialized `<theme-kit-provider>` is present.
 *
 * @example
 * ```ts
 * const runtime = useThemeRuntime();
 * runtime.selection.setMode("dark");
 * ```
 *
 * @see {@link getProviderRuntime}
 * @see {@link defineCustomElements}
 */
export function useThemeRuntime() {
  const el = document.querySelector<HTMLElement>("theme-kit-provider");
  const runtime = el ? findProviderRuntime(el) : undefined;
  if (!runtime) {
    throw new Error("useThemeRuntime must be used after a <theme-kit-provider> has initialized");
  }
  return runtime;
}

/**
 * Returns the currently selected theme definition from the active runtime.
 *
 * Framework-free (vanilla JS). Requires an initialized `<theme-kit-provider>`.
 *
 * @returns The active theme definition.
 *
 * @see {@link useThemeRuntime}
 * @see {@link defineCustomElements}
 */
export function useThemeValue() {
  return useThemeRuntime().store.get();
}

/**
 * Returns the active theme's token group from the active runtime.
 *
 * Framework-free (vanilla JS). Requires an initialized `<theme-kit-provider>`.
 *
 * @returns The active theme's tokens.
 *
 * @see {@link useThemeRuntime}
 * @see {@link defineCustomElements}
 */
export function useThemeTokens() {
  return useThemeRuntime().store.get().tokens;
}

/**
 * Returns the current theme mode (`system`, `light`, or `dark`).
 *
 * Framework-free (vanilla JS). Requires an initialized `<theme-kit-provider>`.
 *
 * @returns The current mode.
 *
 * @see {@link useThemeRuntime}
 * @see {@link defineCustomElements}
 */
export function useThemeMode() {
  return useThemeRuntime().selection.getMode();
}

/**
 * Returns the current theme family.
 *
 * Framework-free (vanilla JS). Requires an initialized `<theme-kit-provider>`.
 *
 * @returns The current theme family.
 *
 * @see {@link useThemeRuntime}
 * @see {@link defineCustomElements}
 */
export function useThemeFamily() {
  return useThemeRuntime().selection.getFamily();
}

/**
 * Reactive sunrise/sunset schedule controller. Returns `null` when the
 * provider was created without the `scheduled` option.
 *
 * ```ts
 * const schedule = getThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * schedule?.set({ timeZone: "Asia/Kathmandu" });
 * ```
 */
export function getThemeSchedule() {
  return useThemeRuntime().schedule ?? null;
}

/**
 * Registers all Theme Kit custom elements with the browser.
 *
 * Framework-free (vanilla JS). Defines `<theme-kit-provider>`,
 * `<theme-kit-scope>`, `<theme-kit-toggle>`, `<theme-kit-select>`, and
 * `<theme-kit-scrollbar>` if not already registered. Safe to call more than
 * once.
 *
 * @example
 * ```ts
 * import { defineCustomElements } from "@theme-kit/web";
 * defineCustomElements();
 * ```
 *
 * @see {@link ThemeKitProvider}
 */
export function defineCustomElements() {
  ThemeKitProvider.define();
  ThemeKitScope.define();
  ThemeKitToggle.define();
  ThemeKitSelect.define();
  ThemeKitScrollbar.define();
}
