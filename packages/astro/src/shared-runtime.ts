import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";

let globalRuntime: ThemeRuntime<ThemeDefinition> | null = null;

export function setGlobalRuntime(runtime: ThemeRuntime<ThemeDefinition>) {
  globalRuntime = runtime;
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__themeKitRuntime = runtime;
  }
}

export function getGlobalRuntime<T extends ThemeDefinition>(): ThemeRuntime<T> | null {
  return globalRuntime as unknown as ThemeRuntime<T> | null;
}

export function requireGlobalRuntime<T extends ThemeDefinition>(): ThemeRuntime<T> {
  if (!globalRuntime) {
    throw new Error(
      "ThemeRuntime not initialized. Did you render <ThemeProvider> at the root of your layout?",
    );
  }
  return globalRuntime as unknown as ThemeRuntime<T>;
}
