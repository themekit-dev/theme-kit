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
export { ThemeKitScrollbar } from "./scrollbar";
export { ThemeKitInspector } from "./inspector";
export type { ThemeKitProviderProps } from "./provider";

export function useThemeRuntime() {
  const el = document.querySelector<HTMLElement>("theme-kit-provider");
  const runtime = el ? findProviderRuntime(el) : undefined;
  if (!runtime) {
    throw new Error("useThemeRuntime must be used after a <theme-kit-provider> has initialized");
  }
  return runtime;
}

export function useThemeValue() {
  return useThemeRuntime().store.get();
}

export function useThemeTokens() {
  return useThemeRuntime().store.get().tokens;
}

export function useThemeMode() {
  return useThemeRuntime().selection.getMode();
}

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

export function defineCustomElements() {
  ThemeKitProvider.define();
  ThemeKitScope.define();
  ThemeKitToggle.define();
  ThemeKitSelect.define();
  ThemeKitScrollbar.define();
}
