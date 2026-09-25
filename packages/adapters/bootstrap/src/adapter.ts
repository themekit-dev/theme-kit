import type {
  AdapterPlugin,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import { resolveAdapterSource } from "@theme-kit/adapters";
import { generateBootstrapVariables } from "./generator";
import { injectCSS, removeCSS, toCSS } from "./inject";
import {
  BOOTSTRAP_VARIABLES_STYLE_ID,
  BOOTSTRAP_STYLE_ID,
  DEFAULT_BOOTSTRAP_OPTIONS,
  type BootstrapAdapterOptions,
} from "./defaults";
import bootstrapCss from "./bootstrap.css";

/**
 * Options for {@link createBootstrapAdapter}.
 *
 * @see {@link createBootstrapAdapter}
 */
export interface CreateBootstrapAdapterOptions extends BootstrapAdapterOptions {
  /**
   * Adapter plugins that customize how the Bootstrap CSS variables are
   * generated. Defaults to no plugins.
   */
  plugins?: AdapterPlugin[];
}

/**
 * Creates a Bootstrap adapter.
 *
 * The adapter is a DOM-only, framework-free adapter: it depends only on
 * `@theme-kit/core` and the DOM. On install it injects the Bootstrap
 * compatibility stylesheet (when enabled) and a `<style>` element of CSS
 * variables derived from the active theme, then subscribes to the runtime
 * store and rewrites the variables whenever the theme selection changes. It
 * does not render any component or require a React tree.
 *
 * On uninstall it removes the injected styles and unsubscribes from the store.
 *
 * @param options Adapter options. Defaults to `{}`.
 * @returns A `ThemeAdapter` for Bootstrap.
 *
 * @example
 * ```ts
 * import { createBootstrapAdapter } from "@theme-kit/bootstrap";
 *
 * runtime.installAdapter(createBootstrapAdapter());
 * ```
 *
 * @see {@link useBootstrapTheme}
 */
export function createBootstrapAdapter<T extends ThemeDefinition>(
  options: CreateBootstrapAdapterOptions = {},
): ThemeAdapter<T> {
  const strategy: AdapterStrategy =
    options.strategy ?? DEFAULT_BOOTSTRAP_OPTIONS.strategy;
  const injectCSSOption =
    options.injectCSS ?? DEFAULT_BOOTSTRAP_OPTIONS.injectCSS;
  const plugins = options.plugins ?? [];

  let styleEl: HTMLStyleElement | null = null;
  let cssEl: HTMLStyleElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function apply(theme: ThemeDefinition) {
    const themeObj = resolveAdapterSource(theme as never);
    const variables = generateBootstrapVariables(themeObj, { strategy, plugins });

    if (styleEl) {
      styleEl.textContent = toCSS(variables);
    }
  }

  function install(runtime: ThemeRuntime<T>) {
    if (typeof document === "undefined") return;

    if (injectCSSOption) {
      cssEl = injectCSS(BOOTSTRAP_STYLE_ID, bootstrapCss);
    }

    styleEl = injectCSS(
      BOOTSTRAP_VARIABLES_STYLE_ID,
      toCSS(
        generateBootstrapVariables(resolveAdapterSource(runtime.store.get()), {
          strategy,
          plugins,
        }),
      ),
    );
    styleEl.setAttribute("data-theme-kit", "bootstrap");

    unsubscribe = runtime.store.subscribe(() => {
      apply(runtime.store.get());
    });
  }

  function uninstall() {
    unsubscribe?.();
    unsubscribe = null;
    removeCSS(BOOTSTRAP_VARIABLES_STYLE_ID);
    if (cssEl) {
      cssEl.remove();
      cssEl = null;
    }
    styleEl = null;
  }

  return {
    id: "bootstrap",
    supports: () => true,
    install,
    uninstall,
  };
}
