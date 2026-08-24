"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import { createCSSVariablesBinding } from "@theme-kit/core";

/**
 * Subscribes to a Theme Kit runtime and re-runs `factory` whenever the active
 * theme changes, returning the latest derived value (e.g. a MUI / Mantine /
 * Chakra / Ant Design theme object). The factory must be referentially stable
 * or wrapped in `useCallback` to avoid recomputing on every render.
 */
export function useRuntimeThemeFactory<T extends ThemeDefinition, R>(
  runtime: ThemeRuntime<T>,
  factory: (theme: T) => R,
): R {
  const subscribe = useCallback(
    (listener: () => void) => runtime.store.subscribe(() => listener()),
    [runtime],
  );
  const getSnapshot = useCallback(() => runtime.store.get(), [runtime]);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => factory(theme), [factory, theme]);
}

/**
 * Sets up a CSS variables binding that keeps `--theme-*` custom properties
 * in sync with the active Theme Kit theme. Call this in a client component
 * (e.g. at the app root) to enable CSS-based adapters like shadcn, daisyUI,
 * Bootstrap, and Open Props.
 */
export function useCSSVariables(
  runtime: ThemeRuntime<any>,
  options?: { prefix?: string },
): void {
  useEffect(() => {
    const binding = createCSSVariablesBinding(runtime.store, {
      prefix: options?.prefix ?? "theme-",
    });
    return () => binding?.destroy();
  }, [runtime, options?.prefix]);
}