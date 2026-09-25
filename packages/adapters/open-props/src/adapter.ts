import type {
  AdapterPlugin,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import { resolveAdapterSource } from "@theme-kit/adapters";
import { generateOpenPropsVariables } from "./generator";
import { injectCSS, removeCSS, toCSS } from "./inject";
import {
  OPEN_PROPS_VARIABLES_STYLE_ID,
  OPEN_PROPS_STYLE_ID,
  DEFAULT_OPEN_PROPS_OPTIONS,
  type OpenPropsAdapterOptions,
} from "./defaults";
import openPropsCss from "./open-props.css";

/**
 * Options for {@link createOpenPropsAdapter}.
 *
 * @see {@link createOpenPropsAdapter}
 */
export interface CreateOpenPropsAdapterOptions extends OpenPropsAdapterOptions {
  /**
   * Adapter plugins that customize how the Open Props CSS variables are
   * generated. Defaults to no plugins.
   */
  plugins?: AdapterPlugin[];
}

/**
 * Creates an Open Props adapter.
 *
 * The adapter is a DOM-only, framework-free adapter: it depends only on
 * `@theme-kit/core` and the DOM. On install it injects the Open Props
 * compatibility stylesheet (when enabled) and a `<style>` element of CSS
 * variables derived from the active theme, then subscribes to the runtime
 * store and rewrites the variables whenever the theme selection changes. It
 * does not render any component or require a React tree.
 *
 * On uninstall it removes the injected styles and unsubscribes from the store.
 *
 * @param options Adapter options. Defaults to `{}`.
 * @returns A `ThemeAdapter` for Open Props.
 *
 * @example
 * ```ts
 * import { createOpenPropsAdapter } from "@theme-kit/open-props";
 *
 * runtime.installAdapter(createOpenPropsAdapter());
 * ```
 *
 * @see {@link useOpenPropsTheme}
 */
export function createOpenPropsAdapter<T extends ThemeDefinition>(
  options: CreateOpenPropsAdapterOptions = {},
): ThemeAdapter<T> {
  const strategy: AdapterStrategy =
    options.strategy ?? DEFAULT_OPEN_PROPS_OPTIONS.strategy;
  const injectCSSOption =
    options.injectCSS ?? DEFAULT_OPEN_PROPS_OPTIONS.injectCSS;
  const plugins = options.plugins ?? [];

  let styleEl: HTMLStyleElement | null = null;
  let cssEl: HTMLStyleElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function apply(theme: ThemeDefinition) {
    const themeObj = resolveAdapterSource(theme as never);
    const variables = generateOpenPropsVariables(themeObj, {
      strategy,
      plugins,
    });

    if (styleEl) {
      styleEl.textContent = toCSS(variables);
    }
  }

  function install(runtime: ThemeRuntime<T>) {
    if (typeof document === "undefined") return;

    if (injectCSSOption) {
      cssEl = injectCSS(OPEN_PROPS_STYLE_ID, openPropsCss);
    }

    styleEl = injectCSS(
      OPEN_PROPS_VARIABLES_STYLE_ID,
      toCSS(
        generateOpenPropsVariables(resolveAdapterSource(runtime.store.get()), {
          strategy,
          plugins,
        }),
      ),
    );
    styleEl.setAttribute("data-theme-kit", "open-props");

    unsubscribe = runtime.store.subscribe(() => {
      apply(runtime.store.get());
    });
  }

  function uninstall() {
    unsubscribe?.();
    unsubscribe = null;
    removeCSS(OPEN_PROPS_VARIABLES_STYLE_ID);
    if (cssEl) {
      cssEl.remove();
      cssEl = null;
    }
    styleEl = null;
  }

  return {
    id: "open-props",
    supports: () => true,
    install,
    uninstall,
  };
}