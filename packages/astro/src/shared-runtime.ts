import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";

let globalRuntime: ThemeRuntime<ThemeDefinition> | null = null;

/**
 * Installs the given runtime as the app-wide global runtime and, in the
 * browser, publishes it where the rest of Theme Kit looks for it.
 *
 * @param runtime - The theme runtime to install globally.
 *
 * @remarks
 * Three publications, all of them the same runtime:
 *
 * 1. the module-level `globalRuntime` — what this package's hooks read;
 * 2. `window.__themeKitRuntime` — the documented escape hatch;
 * 3. `document.documentElement.__themeKitRuntime` plus a `theme-ready` event —
 *    which is how `@theme-kit/web`'s custom elements (`<theme-kit-scrollbar>`,
 *    `<theme-kit-inspector>`, `<theme-kit-toggle>`, …) find a runtime. They
 *    resolve it by walking **DOM ancestors** for that property, and they only
 *    fall back to waiting for `theme-ready`, which until now was dispatched
 *    solely by `<theme-kit-provider>`. Without these two lines an Astro app
 *    that installs its runtime from a React island had no way to use the
 *    framework-neutral elements at all — the runtime existed, but nothing in
 *    the element tree could see it.
 *
 * @see {@link getGlobalRuntime}
 */
export function setGlobalRuntime(runtime: ThemeRuntime<ThemeDefinition>) {
  globalRuntime = runtime;
  if (typeof window === "undefined") return;

  (window as unknown as Record<string, unknown>).__themeKitRuntime = runtime;

  const root = document.documentElement as unknown as Record<string, unknown> | null;
  if (root) root.__themeKitRuntime = runtime;

  // Elements that mounted before the runtime existed are parked on this event.
  document.dispatchEvent(new CustomEvent("theme-ready", { detail: { runtime } }));
}

/**
 * Returns the app-wide global runtime, or `null` when none has been installed
 * yet (e.g. before `ThemeProviderClient` mounts).
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The installed runtime, or `null`.
 *
 * @see {@link setGlobalRuntime}
 */
export function getGlobalRuntime<T extends ThemeDefinition>(): ThemeRuntime<T> | null {
  return globalRuntime as unknown as ThemeRuntime<T> | null;
}

/**
 * Returns the app-wide global runtime, throwing when none has been installed.
 *
 * @typeParam T - The theme definition type used by the application.
 * @returns The installed runtime.
 *
 * @throws {Error} When no runtime has been initialized (no `ThemeProviderClient` mounted).
 *
 * @see {@link getGlobalRuntime}
 * @see {@link setGlobalRuntime}
 */
export function requireGlobalRuntime<T extends ThemeDefinition>(): ThemeRuntime<T> {
  if (!globalRuntime) {
    throw new Error(
      "ThemeRuntime not initialized. useTheme*() and ThemeScope must run inside the island that owns the runtime: render them as children/siblings of <ThemeProviderClient> in the SAME island. Mounting them as separate client:only islands races, because Astro hydrates islands in an unspecified order and the consuming island may render before the provider island installs the runtime.",
    );
  }
  return globalRuntime as unknown as ThemeRuntime<T>;
}
