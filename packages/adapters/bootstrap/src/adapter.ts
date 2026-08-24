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

export interface CreateBootstrapAdapterOptions extends BootstrapAdapterOptions {
  plugins?: AdapterPlugin[];
}

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
