/**
 * Angular injection helper for the Bootstrap adapter
 * (`@theme-kit/bootstrap/angular`).
 *
 * `injectBootstrapTheme(runtime, options?)` registers the Bootstrap adapter on
 * an explicitly provided Theme Kit runtime and unregisters it when the current
 * injection context is destroyed.
 *
 * @packageDocumentation
 */
import { DestroyRef, inject } from "@angular/core";
import type {
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";

import { createBootstrapAdapter } from "./adapter";

/**
 * Options for the Angular adapter injection functions (for example
 * {@link injectBootstrapTheme}).
 */
export interface InjectAdapterOptions {
  /**
   * The adapter strategy to use when registering the adapter.
   */
  strategy?: AdapterStrategy;
}

/**
 * Angular injectable that registers the Bootstrap adapter on the given Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--bs-*` variables (including `-rgb` triplets), kept in sync as the active
 * theme changes.
 *
 * Call in your component (or root) constructor or field initializer — the
 * function uses `DestroyRef` to unregister the adapter, so it must run in an
 * injection context (the runtime usually comes from
 * `injectThemeRuntime()` in `@theme-kit/angular`):
 *
 * ```ts
 * import { injectBootstrapTheme } from "@theme-kit/bootstrap/angular";
 *
 * export class AppComponent {
 *   adapter = injectBootstrapTheme(runtime);
 * }
 * ```
 *
 * @param runtime The active Theme Kit runtime to register the adapter on.
 * @param options Adapter options. Defaults to `{}`.
 * @returns The installed adapter instance.
 *
 * @see {@link injectShadcnTheme}
 */
export function injectBootstrapTheme<T extends ThemeDefinition = ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  options: InjectAdapterOptions = {},
): ThemeAdapter<T> {
  const adapter = createBootstrapAdapter(
    options.strategy ? { strategy: options.strategy } : {},
  ) as ThemeAdapter<T>;

  const handle = runtime.adapters.use(adapter);
  inject(DestroyRef).onDestroy(() => {
    handle.dispose();
  });

  return adapter;
}
