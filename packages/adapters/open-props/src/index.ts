"use client";

import { useEffect, useRef } from "react";
import type { AdapterStrategy, ThemeDefinition } from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/react";
import openPropsCss from "./open-props.css";

import { createOpenPropsAdapter } from "./adapter";
import { createOpenPropsVariables } from "./generator";

export { createOpenPropsAdapter, createOpenPropsVariables };
export type { CreateOpenPropsAdapterOptions } from "./adapter";
export type { OpenPropsAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/open-props";

/**
 * Injects the Open Props compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useOpenPropsTheme` installs an adapter.
 */
export function injectOpenPropsCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = openPropsCss;
  document.head.appendChild(style);
}

/**
 * React hook that installs the Open Props adapter onto the active Theme Kit
 * runtime. The adapter maintains a tagged `:root` style element containing
 * concrete `--color-*` / `--brand` / `--size-*` / `--shadow-*` variables in
 * sync as the theme changes.
 *
 * Call once in your app root:
 *
 * ```tsx
 * import { useOpenPropsTheme } from "@theme-kit/open-props";
 *
 * function App() {
 *   useOpenPropsTheme();
 *   return <YourApp />;
 * }
 * ```
 */
export function useOpenPropsTheme(options?: {
  strategy?: AdapterStrategy;
}): void {
  const runtime = useThemeRuntime<ThemeDefinition>();

  const adapterRef = useRef<ReturnType<typeof createOpenPropsAdapter> | null>(
    null,
  );
  if (!adapterRef.current) {
    adapterRef.current = createOpenPropsAdapter(
      options?.strategy ? { strategy: options.strategy } : {},
    );
  }

  useEffect(() => {
    const adapter = adapterRef.current!;
    injectOpenPropsCSS();
    const handle = runtime.adapters.use(adapter);
    return () => {
      handle.dispose();
    };
  }, [runtime, adapterRef.current, options?.strategy]);
}