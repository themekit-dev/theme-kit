"use client";

import { useEffect, useRef } from "react";
import type { AdapterStrategy, ThemeDefinition } from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/react";
import bootstrapCss from "./bootstrap.css";

import { createBootstrapAdapter } from "./adapter";
import { createBootstrapVariables } from "./generator";

export { createBootstrapAdapter, createBootstrapVariables };
export type { CreateBootstrapAdapterOptions } from "./adapter";
export type { BootstrapAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/bootstrap";

/**
 * Injects the Bootstrap compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useBootstrapTheme` installs an adapter.
 */
export function injectBootstrapCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = bootstrapCss;
  document.head.appendChild(style);
}

/**
 * React hook that installs the Bootstrap adapter onto the active Theme Kit
 * runtime. The adapter maintains a tagged `:root` style element containing
 * concrete `--bs-*` variables (including `-rgb` triplets) and keeps them in
 * sync as the theme changes.
 *
 * Call once in your app root:
 *
 * ```tsx
 * import { useBootstrapTheme } from "@theme-kit/bootstrap";
 *
 * function App() {
 *   useBootstrapTheme();
 *   return <YourApp />;
 * }
 * ```
 */
export function useBootstrapTheme(options?: { strategy?: AdapterStrategy }): void {
  const runtime = useThemeRuntime<ThemeDefinition>();

  const adapterRef = useRef<ReturnType<typeof createBootstrapAdapter> | null>(
    null,
  );
  if (!adapterRef.current) {
    adapterRef.current = createBootstrapAdapter(
      options?.strategy ? { strategy: options.strategy } : {},
    );
  }

  useEffect(() => {
    const adapter = adapterRef.current!;
    injectBootstrapCSS();
    const handle = runtime.adapters.use(adapter);
    return () => {
      handle.dispose();
    };
  }, [runtime, adapterRef.current, options?.strategy]);
}
