import type { ThemeDefinition } from "../../model/theme";
import type { ThemePlugin } from "../types";
import type { ThemeStore } from "../../types";
import { createScheduledThemeBinding } from "../../adapters/scheduled";
import { resolveScheduledThemePair } from "../../adapters/schedule";

export interface ScheduledPluginOptions<T extends ThemeDefinition> {
  /** Theme applied between sunrise and sunset. Optional — when omitted the
   *  schedule derives it from the currently selected theme's family (or falls
   *  back to the built-in neutral `"light"` theme). */
  lightTheme?: T["name"];
  /** Theme applied between sunset and sunrise. Optional — same derivation as
   *  `lightTheme`, falling back to the built-in neutral `"dark"` theme. */
  darkTheme?: T["name"];
  /** Explicit coordinates. Optional — when omitted the location is resolved
   *  from `timeZone` or the visitor's browser timezone. */
  latitude?: number;
  longitude?: number;
  /** IANA timezone to resolve coordinates from when `latitude`/`longitude`
   *  are omitted (e.g. `"Asia/Kathmandu"`). */
  timeZone?: string;
  /** Auto-detect the visitor's location from their browser timezone when no
   *  explicit coordinates/timezone are given. Default `true`. */
  autoDetectLocation?: boolean;
  checkInterval?: number;
  skipApplyMs?: number;
  /** Start enabled. Default `true`. */
  enabled?: boolean;
}

export function createScheduledPlugin<T extends ThemeDefinition>(
  options: ScheduledPluginOptions<T>,
): ThemePlugin<T> {
  let binding: ReturnType<typeof createScheduledThemeBinding> | null = null;
  let store: ThemeStore<T> | null = null;
  let themes: readonly T[] = [];
  let unsubscribe: (() => void) | null = null;
  let lightTheme: T | null = null;
  let darkTheme: T | null = null;

  function installBinding() {
    if (!store) return;
    const resolved = resolveScheduledThemePair(themes, options, store.get());
    lightTheme = resolved.light;
    darkTheme = resolved.dark;

    if (!lightTheme || !darkTheme) {
      console.warn(
        `[theme-kit] Scheduled plugin: could not resolve light/dark themes. Light="${options.lightTheme ?? "auto"}", Dark="${options.darkTheme ?? "auto"}"`,
      );
      return;
    }

    binding?.destroy();
    binding = createScheduledThemeBinding(store, {
      lightTheme,
      darkTheme,
      ...(options.latitude !== undefined ? { latitude: options.latitude } : {}),
      ...(options.longitude !== undefined ? { longitude: options.longitude } : {}),
      ...(options.timeZone !== undefined ? { timeZone: options.timeZone } : {}),
      ...(options.autoDetectLocation !== undefined
        ? { autoDetectLocation: options.autoDetectLocation }
        : {}),
      ...(options.checkInterval !== undefined ? { checkInterval: options.checkInterval } : {}),
      ...(options.skipApplyMs !== undefined ? { skipApplyMs: options.skipApplyMs } : {}),
      ...(options.enabled !== undefined ? { enabled: options.enabled } : {}),
    });
  }

  return {
    name: "scheduled",
    version: "1.0.0",
    priority: 40,

    onRuntimeCreated(runtime) {
      store = runtime.store as ThemeStore<T>;
      themes = runtime.themes as T[];

      installBinding();

      // Re-resolve when the user switches theme family so auto-derived
      // light/dark themes follow the current selection.
      unsubscribe = store.subscribe(() => {
        const resolved = resolveScheduledThemePair(themes, options, store!.get());
        if (resolved.light !== lightTheme || resolved.dark !== darkTheme) {
          installBinding();
        }
      });
    },

    onDestroy() {
      binding?.destroy();
      binding = null;
      unsubscribe?.();
      unsubscribe = null;
      store = null;
      themes = [];
      lightTheme = null;
      darkTheme = null;
    },
  };
}
