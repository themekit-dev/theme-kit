/**
 * Solid composable for the shadcn/ui adapter (`@theme-kit/shadcn/solid`).
 *
 * `useShadcnTheme(runtime, options?)` installs the shadcn adapter onto an
 * explicitly provided Theme Kit runtime and disposes it on cleanup.
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

import { createShadcnAdapter } from "./adapter";

/**
 * Options accepted by the Solid adapter composables
 * (e.g. {@link useShadcnTheme}).
 */
export interface UseAdapterOptions {
  /**
   * The adapter strategy to use. When omitted, the adapter's default strategy
   * applies.
   */
  strategy?: AdapterStrategy;
}

/**
 * Solid composable that installs the shadcn/ui adapter onto the given Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Must be called within a Solid reactive root, passing the runtime from your
 * Theme Kit provider (e.g. `useThemeRuntime()` from `@theme-kit/solid`):
 *
 * ```tsx
 * import { useShadcnTheme } from "@theme-kit/shadcn/solid";
 *
 * function App() {
 *   useShadcnTheme(runtime);
 *   return <YourApp />;
 * }
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
  onMount(() => {
    handle = runtime.adapters.use(adapter);
  });
  onCleanup(() => {
    handle?.dispose();
    handle = null;
  });

  return adapter;
}
