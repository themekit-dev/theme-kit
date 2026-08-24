"use client";

import { useEffect, useRef } from "react";
import type { AdapterStrategy, ThemeDefinition } from "@theme-kit/core";
import { useThemeRuntime } from "@theme-kit/react";
import shadcnCss from "./shadcn.css";

import { createShadcnAdapter } from "./adapter";
import { createShadcnVariables } from "./generator";

export { createShadcnAdapter, createShadcnVariables };
export type { CreateShadcnAdapterOptions } from "./adapter";
export type { ShadcnAdapterOptions } from "./defaults";

const STYLE_ID = "@theme-kit/shadcn";

/**
 * Injects the shadcn/ui compatibility CSS (idempotent, SSR-safe). Called
 * automatically the first time `useShadcnTheme` installs an adapter.
 */
export function injectShadcnCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-css", "");
  style.textContent = shadcnCss;
  document.head.appendChild(style);
}

/**
 * React hook that installs the shadcn adapter onto the active Theme Kit
 * runtime. The adapter maintains a tagged `:root` style element containing
 * concrete `--*` variables in sync as the theme changes.
 *
 * Call once in your app root:
 *
 * ```tsx
 * import { useShadcnTheme } from "@theme-kit/shadcn";
 *
 * function App() {
 *   useShadcnTheme();
 *   return <YourApp />;
 * }
 * ```
 */
export function useShadcnTheme(options?: { strategy?: AdapterStrategy }): void {
  const runtime = useThemeRuntime<ThemeDefinition>();

  const adapterRef = useRef<ReturnType<typeof createShadcnAdapter> | null>(
    null,
  );
  if (!adapterRef.current) {
    adapterRef.current = createShadcnAdapter(
      options?.strategy ? { strategy: options.strategy } : {},
    );
  }

  useEffect(() => {
    const adapter = adapterRef.current!;
    injectShadcnCSS();
    const handle = runtime.adapters.use(adapter);
    return () => {
      handle.dispose();
    };
  }, [runtime, adapterRef.current, options?.strategy]);
}