import { inject, DestroyRef } from "@angular/core";
import type { ThemeRuntime, ThemeDefinition, AdapterStrategy } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";
import { injectThemeRuntime } from "./hooks";

export interface InjectAdapterOptions {
  strategy?: AdapterStrategy;
}

function registerAdapter<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  create: () => import("@theme-kit/core").ThemeAdapter<T>,
): import("@theme-kit/core").ThemeAdapter<T> {
  const adapter = create();
  const destroyRef = inject(DestroyRef);

  const handle = runtime.adapters.use(adapter);
  destroyRef.onDestroy(() => {
    handle.dispose();
  });

  return adapter;
}

/**
 * Angular injectable that registers the shadcn/ui adapter on the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Call in your component (or root) constructor or field initializer:
 *
 * ```ts
 * import { injectShadcnTheme } from "@theme-kit/angular";
 *
 * export class AppComponent {
 *   adapter = injectShadcnTheme();
 * }
 * ```
 */
export function injectShadcnTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: InjectAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return registerAdapter<T>(
    injectThemeRuntime<T>(),
    () =>
      createShadcnAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Angular injectable that registers the Bootstrap adapter on the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--bs-*` variables (including `-rgb` triplets), kept in sync as the active
 * theme changes.
 */
export function injectBootstrapTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: InjectAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return registerAdapter<T>(
    injectThemeRuntime<T>(),
    () =>
      createBootstrapAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Angular injectable that registers the daisyUI adapter on the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--color-*` variables, kept in sync as the active theme changes.
 */
export function injectDaisyTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: InjectAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return registerAdapter<T>(
    injectThemeRuntime<T>(),
    () =>
      createDaisyAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Angular injectable that registers the Open Props adapter on the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--brand`, `--link`, `--size-*` and related variables, kept in sync as the
 * active theme changes.
 */
export function injectOpenPropsTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: InjectAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return registerAdapter<T>(
    injectThemeRuntime<T>(),
    () =>
      createOpenPropsAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}
