"use client";

import { useEffect, useRef } from "react";
import type { AdapterStrategy, ThemeDefinition } from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/react";
import daisyCss from "./daisyui.css";

import { createDaisyAdapter } from "./adapter";
import { createDaisyVariables } from "./generator";

export { createDaisyAdapter, createDaisyVariables };
export type { CreateDaisyAdapterOptions } from "./adapter";
export type { DaisyAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/daisyui";

/**
 * Injects the daisyUI compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useDaisyTheme` installs an adapter.
 */
export function injectDaisyCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = daisyCss;
  document.head.appendChild(style);
}

/**
 * React hook that installs the daisyUI adapter onto the active Theme Kit
 * runtime. The adapter maintains a tagged `:root` style element containing
 * concrete `--color-*` variables in sync as the theme changes.
 *
 * Call once in your app root:
 *
 * ```tsx
 * import { useDaisyTheme } from "@theme-kit/daisyui";
 *
 * function App() {
 *   useDaisyTheme();
 *   return <YourApp />;
 * }
 * ```
 */
export function useDaisyTheme(options?: { strategy?: AdapterStrategy }): void {
  const runtime = useThemeRuntime<ThemeDefinition>();

  const adapterRef = useRef<ReturnType<typeof createDaisyAdapter> | null>(null);
  if (!adapterRef.current) {
    adapterRef.current = createDaisyAdapter(
      options?.strategy ? { strategy: options.strategy } : {},
    );
  }

  useEffect(() => {
    const adapter = adapterRef.current!;
    injectDaisyCSS();
    const handle = runtime.adapters.use(adapter);
    return () => {
      handle.dispose();
    };
  }, [runtime, adapterRef.current, options?.strategy]);
}