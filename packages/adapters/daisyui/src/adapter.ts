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

export interface CreateDaisyAdapterOptions extends DaisyAdapterOptions {
  plugins?: AdapterPlugin[];
}

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