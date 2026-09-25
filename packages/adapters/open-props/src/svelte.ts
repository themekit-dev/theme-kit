/**
 * Svelte composable for the Open Props adapter (`@theme-kit/open-props/svelte`).
 *
 * `useOpenPropsTheme(runtime, options?)` installs the Open Props adapter onto
 * an explicitly provided Theme Kit runtime and disposes it on unmount.
 *
 * @packageDocumentation
 */
import { onMount } from "svelte";
import type {
  AdapterRegistration,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";

import { createOpenPropsAdapter } from "./adapter";

/**
 * Options accepted by the Svelte adapter composables (e.g.
 * {@link useOpenPropsTheme}).
 */
export interface UseAdapterOptions {
  /**
   * The adapter strategy to use. When omitted, the adapter's default strategy
   * applies.
   */
  strategy?: AdapterStrategy;
}

/**
 * Svelte composable that installs the Open Props adapter onto the given Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--brand`, `--link`, `--size-*` and related variables, kept in sync as the
 * active theme changes.
 *
 * Must be called during component initialization, passing the runtime from
 * your Theme Kit provider (e.g. `getThemeRuntime()` from `@theme-kit/svelte`):
 *
 * ```ts
 * import { useOpenPropsTheme } from "@theme-kit/open-props/svelte";
 *
 * useOpenPropsTheme(runtime);
 * ```
 *
 * The adapter installs synchronously (guarded on `window`, so it is SSR-safe)
 * and is disposed via Svelte's effect tree.
 *
 * @param runtime The active Theme Kit runtime to install the adapter on.
 * @param options Adapter options. Defaults to `{}`.
 * @returns The installed adapter instance.
 *
 * @see `createOpenPropsAdapter`
 */
export function useOpenPropsTheme<T extends ThemeDefinition = ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  options: UseAdapterOptions = {},
): ThemeAdapter<T> {
  const adapter = createOpenPropsAdapter(
    options.strategy ? { strategy: options.strategy } : {},
  ) as ThemeAdapter<T>;

  let handle: AdapterRegistration | null = null;
  if (typeof window !== "undefined") {
    handle = runtime.adapters.use(adapter);
  }

  // Teardown via `onMount` so Svelte's effect tree disposes the adapter in
  // runes mode and in legacy mode (when the parent emits `$.init()`).
  onMount(() => () => {
    handle?.dispose();
    handle = null;
  });

  return adapter;
}
