/**
 * Vue composable for the shadcn/ui adapter (`@theme-kit/shadcn/vue`).
 *
 * `useShadcnTheme(runtime, options?)` installs the shadcn adapter onto an
 * explicitly provided Theme Kit runtime and disposes it on unmount.
 *
 * @packageDocumentation
 */
import { onMounted, onUnmounted } from "vue";
import type {
  AdapterRegistration,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";

import { createShadcnAdapter } from "./adapter";

/**
 * Options accepted by the adapter composables (e.g. {@link useShadcnTheme}).
 */
export interface UseAdapterOptions {
  /**
   * The adapter strategy to use. When omitted, the adapter's default strategy
   * applies.
   */
  strategy?: AdapterStrategy;
}

/**
 * Vue composable that installs the shadcn/ui adapter onto the given Theme Kit
 * runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Must be called in a component's `setup` scope, passing the runtime from your
 * Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/vue`):
 *
 * ```ts
 * import { useShadcnTheme } from "@theme-kit/shadcn/vue";
 *
 * useShadcnTheme(runtime);
 * ```
 *
 * @param runtime The active Theme Kit runtime to install the adapter on.
 * @param options Adapter options. Defaults to `{}`.
 * @returns The installed adapter instance.
 *
 * @see `createShadcnAdapter`
 */
export function useShadcnTheme<T extends ThemeDefinition = ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  options: UseAdapterOptions = {},
): ThemeAdapter<T> {
  const adapter = createShadcnAdapter(
    options.strategy ? { strategy: options.strategy } : {},
  ) as ThemeAdapter<T>;

  let handle: AdapterRegistration | null = null;
  onMounted(() => {
    handle = runtime.adapters.use(adapter);
  });
  onUnmounted(() => {
    handle?.dispose();
    handle = null;
  });

  return adapter;
}
