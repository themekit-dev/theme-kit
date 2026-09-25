/**
 * React hook for the daisyUI adapter (`@theme-kit/daisyui/react`).
 *
 * `useDaisyTheme(runtime, options?)` installs the daisyUI adapter onto an
 * explicitly provided Theme Kit runtime and disposes it on unmount.
 *
 * @packageDocumentation
 */
"use client";

import { useEffect, useRef } from "react";
import type {
  AdapterStrategy,
  ThemeDefinition,
  ThemeRuntime,
} from "@theme-kit/core";

import { createDaisyAdapter } from "./adapter";
import { injectDaisyCSS } from "./index";

/**
 * React hook that installs the daisyUI adapter onto the given Theme Kit
 * runtime. The adapter maintains a tagged `:root` style element containing
 * concrete `--color-*` variables in sync as the theme changes.
 *
 * Call once in your app root, passing the runtime from your Theme Kit
 * provider (e.g. the `useThemeRuntime()` hook from `@theme-kit/react`):
 *
 * ```tsx
 * import { useDaisyTheme } from "@theme-kit/daisyui/react";
 *
 * function App() {
 *   useDaisyTheme(runtime);
 *   return <YourApp />;
 * }
 * ```
 *
 * @param runtime The active Theme Kit runtime to install the adapter on.
 * @param options Adapter options. Defaults to `{}`.
 *
 * @see {@link createDaisyAdapter}
 */
export function useDaisyTheme<T extends ThemeDefinition = ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  options?: { strategy?: AdapterStrategy },
): void {
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
  }, [runtime, options?.strategy]);
}
