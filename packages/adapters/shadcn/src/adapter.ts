import type {
  AdapterPlugin,
  AdapterStrategy,
  ThemeAdapter,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";
import { resolveAdapterSource } from "@theme-kit/adapters";
import { generateShadcnVariables } from "./generator";
import { injectCSS, removeCSS, toCSS } from "./inject";
import {
  SHADCN_VARIABLES_STYLE_ID,
  SHADCN_STYLE_ID,
  DEFAULT_SHADCN_OPTIONS,
  type ShadcnAdapterOptions,
} from "./defaults";
import shadcnCss from "./shadcn.css";

export interface CreateShadcnAdapterOptions extends ShadcnAdapterOptions {
  plugins?: AdapterPlugin[];
}

export function createShadcnAdapter<T extends ThemeDefinition>(
  options: CreateShadcnAdapterOptions = {},
): ThemeAdapter<T> {
  const strategy: AdapterStrategy =
    options.strategy ?? DEFAULT_SHADCN_OPTIONS.strategy;
  const injectCSSOption =
    options.injectCSS ?? DEFAULT_SHADCN_OPTIONS.injectCSS;
  const plugins = options.plugins ?? [];

  let styleEl: HTMLStyleElement | null = null;
  let cssEl: HTMLStyleElement | null = null;
  let unsubscribe: (() => void) | null = null;

  function apply(theme: ThemeDefinition) {
    const themeObj = resolveAdapterSource(theme as never);
    const variables = generateShadcnVariables(themeObj, {
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
      cssEl = injectCSS(SHADCN_STYLE_ID, shadcnCss);
    }

    styleEl = injectCSS(
      SHADCN_VARIABLES_STYLE_ID,
      toCSS(
        generateShadcnVariables(resolveAdapterSource(runtime.store.get()), {
          strategy,
          plugins,
        }),
      ),
    );
    styleEl.setAttribute("data-theme-kit", "shadcn");

    unsubscribe = runtime.store.subscribe(() => {
      apply(runtime.store.get());
    });
  }

  function uninstall() {
    unsubscribe?.();
    unsubscribe = null;
    removeCSS(SHADCN_VARIABLES_STYLE_ID);
    if (cssEl) {
      cssEl.remove();
      cssEl = null;
    }
    styleEl = null;
  }

  return {
    id: "shadcn",
    supports: () => true,
    install,
    uninstall,
  };
}