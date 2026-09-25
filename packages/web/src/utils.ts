import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";

const RUNTIME_SYMBOL = "__themeKitRuntime";

export interface ThemeKitProviderElement extends HTMLElement {
  [RUNTIME_SYMBOL]?: ThemeRuntime<ThemeDefinition>;
}

export function setProviderRuntime(
  el: ThemeKitProviderElement,
  runtime: ThemeRuntime<ThemeDefinition>,
) {
  el[RUNTIME_SYMBOL] = runtime;
}

/**
 * Returns the Theme Kit runtime attached to a provider element, if any.
 *
 * Framework-free (vanilla JS). Reads the runtime stored on the element by
 * {@link setProviderRuntime}.
 *
 * @param el The provider element to read from.
 * @returns The attached runtime, or `undefined` when none is present.
 *
 * @see {@link findProviderRuntime}
 * @see {@link ThemeKitProvider}
 */
export function getProviderRuntime(
  el?: ThemeKitProviderElement,
): ThemeRuntime<ThemeDefinition> | undefined {
  return el?.[RUNTIME_SYMBOL];
}

export function findProviderRuntime(
  el: HTMLElement,
): ThemeRuntime<ThemeDefinition> | undefined {
  let current: HTMLElement | null = el;

  while (current) {
    const runtime = (current as ThemeKitProviderElement)[RUNTIME_SYMBOL];
    if (runtime) return runtime;
    current = current.parentElement;
  }

  return undefined;
}
