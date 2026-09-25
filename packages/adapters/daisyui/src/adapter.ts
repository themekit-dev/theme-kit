import type {
  AdapterPlugin,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import { resolveAdapterSource } from "@theme-kit/adapters";
import { generateDaisyVariables } from "./generator";
import { injectCSS, removeCSS, toCSS } from "./inject";
import {
  DAISY_VARIABLES_STYLE_ID,
  DAISY_STYLE_ID,
  DEFAULT_DAISY_OPTIONS,
  type DaisyAdapterOptions,
} from "./defaults";
import daisyCss from "./daisyui.css";

/**
 * Options for {@link createDaisyAdapter}.
 *
 * @see {@link createDaisyAdapter}
 */
export interface CreateDaisyAdapterOptions extends DaisyAdapterOptions {
  /**
   * Adapter plugins that customize how the daisyUI CSS variables are
   * generated. Defaults to no plugins.
   */
  plugins?: AdapterPlugin[];
}

/**
 * Creates a daisyUI adapter.
 *
 * The adapter is a DOM-only, framework-free adapter: it depends only on
 * `@theme-kit/core` and the DOM. On install it injects the daisyUI
 * compatibility stylesheet (when enabled) and a `<style>` element of CSS
 * variables derived from the active theme, then subscribes to the runtime
 * store and rewrites the variables whenever the theme selection changes. It
 * does not render any component or require a React tree.
 *
 * On uninstall it removes the injected styles and unsubscribes from the store.
 *
 * @param options Adapter options. Defaults to `{}`.
 * @returns A `ThemeAdapter` for daisyUI.
 *
 * @example
 * ```ts
 * import { createDaisyAdapter } from "@theme-kit/daisyui";
 *
 * runtime.installAdapter(createDaisyAdapter());
 * ```
 *
 * @see {@link useDaisyTheme}
 */
export function createDaisyAdapter<T extends ThemeDefinition>(
  options: CreateDaisyAdapterOptions = {},
): ThemeAdapter<T> {
  const strategy: AdapterStrategy =
    options.strategy ?? DEFAULT_DAISY_OPTIONS.strategy;
  const injectCSSOption =
    options.injectCSS ?? DEFAULT_DAISY_OPTIONS.injectCSS;
  const plugins = options.plugins ?? [];

  let styleEl: HTMLStyleElement | null = null;
  let cssEl: HTMLStyleElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function apply(theme: ThemeDefinition) {
    const themeObj = resolveAdapterSource(theme as never);
    const variables = generateDaisyVariables(themeObj, {
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
      cssEl = injectCSS(DAISY_STYLE_ID, daisyCss);
    }

    styleEl = injectCSS(
      DAISY_VARIABLES_STYLE_ID,
      toCSS(
        generateDaisyVariables(resolveAdapterSource(runtime.store.get()), {
          strategy,
          plugins,
        }),
      ),
    );
    styleEl.setAttribute("data-theme-kit", "daisyui");

    unsubscribe = runtime.store.subscribe(() => {
      apply(runtime.store.get());
    });
  }

  function uninstall() {
    unsubscribe?.();
    unsubscribe = null;
    removeCSS(DAISY_VARIABLES_STYLE_ID);
    if (cssEl) {
      cssEl.remove();
      cssEl = null;
    }
    styleEl = null;
  }

  return {
    id: "daisyui",
    supports: () => true,
    install,
    uninstall,
  };
}