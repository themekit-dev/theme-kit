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
