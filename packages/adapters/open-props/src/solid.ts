/**
 * Solid composable for the Open Props adapter (`@theme-kit/open-props/solid`).
 *
 * `useOpenPropsTheme(runtime, options?)` installs the Open Props adapter onto
 * an explicitly provided Theme Kit runtime and disposes it on cleanup.
 *
 * @packageDocumentation
 */
import { onMount, onCleanup } from "solid-js";
import type {
  AdapterRegistration,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";

import { createOpenPropsAdapter } from "./adapter";

/**
 * Options accepted by the Solid adapter composables (e.g.
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
 * Solid composable that installs the Open Props adapter onto the given Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--brand`, `--link`, `--size-*` and related variables, kept in sync as the
 * active theme changes.
 *
 * Must be called within a Solid reactive root, passing the runtime from your
 * Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/solid`):
 *
 * ```tsx
 * import { useOpenPropsTheme } from "@theme-kit/open-props/solid";
 *
 * function App() {
 *   useOpenPropsTheme(runtime);
 *   return <YourApp />;
 * }
 * ```
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
  onMount(() => {
    handle = runtime.adapters.use(adapter);
  });
  onCleanup(() => {
    handle?.dispose();
    handle = null;
  });

  return adapter;
}
