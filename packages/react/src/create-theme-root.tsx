"use client";

import React, { type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import {
  createThemeRuntime,
  createThemeBootstrapScript,
  type ThemeDefinition,
  type ThemeRuntime,
} from "@theme-kit/core";
import { ThemeProvider, type ThemeProviderProps } from "./provider";

/**
 * Options for `createThemeRoot`.
 *
 * Everything `ThemeProvider` accepts (except `children` and `runtime`, which
 * this helper manages), plus:
 *
 * - `container` — the DOM node the root mounts into.
 * - `render` — the application's full composition. Receives the Theme Kit
 *   runtime so dependent library configuration can be derived from it:
 *
 *   ```tsx
 *   createThemeRoot({
 *     container,
 *     themes,
 *     defaultTheme: "mint-light",
 *     initialMode: "system",
 *     render: ({ runtime }) => (
 *       <MuiThemeProvider theme={createMuiTheme(runtime)}>
 *         <QueryClientProvider client={queryClient}>
 *           <App />
 *         </QueryClientProvider>
 *       </MuiThemeProvider>
 *     ),
 *   });
 *   ```
 *
 *   Composition belongs in JSX, so arbitrary provider trees (MUI, Chakra,
 *   React Query, Redux, Router, …) are fully under the application's control.
 *   `render` is the primary (and only) composition mechanism — there is no
 *   separate `children` option.
 */
export interface CreateThemeRootOptions<T extends ThemeDefinition>
  extends Omit<ThemeProviderProps<T>, "children" | "runtime"> {
  /** The DOM node this root mounts into. */
  container: Element | DocumentFragment;
  /**
   * Render the application tree. Called with the Theme Kit runtime so other
   * library providers can derive their configuration from it.
   */
  render: (context: { runtime: ThemeRuntime<T> }) => ReactNode;
}

/** The handle returned by `createThemeRoot`. */
export interface ThemeRootHandle<T extends ThemeDefinition> {
  /** The underlying React root (for manual re-renders if needed). */
  root: Root;
  /** The Theme Kit runtime created for this root. */
  runtime: ThemeRuntime<T>;
  /** Unmount the tree and destroy the runtime. */
  unmount(): void;
}

/**
 * Create a Theme Kit-owned React root for client-rendered (CSR) applications.
 *
 * Theme Kit owns the root boundary: the runtime is created once, and the
 * initial commit is flushed synchronously so the browser's very first frame is
 * already the themed UI. Without it, React's concurrent root can schedule the
 * initial commit after the browser paints an empty/partial frame — visible as
 * a flicker on reload in some applications.
 *
 * This is an **optional, opt-in** helper. Most applications can use the plain
 * React API and it will be smooth:
 *
 * ```tsx
 * const root = createRoot(container);
 * root.render(
 *   <ThemeProvider themes={themes} defaultTheme="mint-light" initialMode="system">
 *     <App />
 *   </ThemeProvider>,
 * );
 * ```
 *
 * Reach for `createThemeRoot` when you want Theme Kit to own the root
 * initialization boundary — for example a reload-sensitive demo, or an app
 * whose providers need the Theme Kit runtime at composition time:
 *
 * ```tsx
 * import { createThemeRoot } from "@theme-kit/react";
 *
 * const handle = createThemeRoot({
 *   container: document.getElementById("root")!,
 *   themes,
 *   defaultTheme: "mint-light",
 *   initialMode: "system",
 *   transition: { enabled: true },
 *   render: ({ runtime }) => (
 *     <MuiThemeProvider theme={createMuiTheme(runtime)}>
 *       <App />
 *     </MuiThemeProvider>
 *   ),
 * });
 *
 * handle.unmount();
 * ```
 *
 * Only the FIRST commit is flushed synchronously; subsequent renders keep
 * React's normal concurrent scheduling. `ThemeProvider` itself never calls
 * `flushSync` — the helper owns the root, which is the one place React
 * documents `flushSync` as appropriate.
 *
 * Do **not** use this helper for SSR/SSG applications — server-rendered HTML
 * must be hydrated with `hydrateRoot()` (or a framework integration such as
 * `@theme-kit/next`), not replaced by a fresh `createRoot`.
 */
export function createThemeRoot<T extends ThemeDefinition>(
  options: CreateThemeRootOptions<T>,
): ThemeRootHandle<T> {
  const { container, render, ...providerOptions } = options;

  const {
    dom: domOptions,
    cssVariables: cssOptions,
    transition: transitionOptions,
    ...coreOptions
  } = providerOptions;

  const resolvedTransition =
    transitionOptions === undefined
      ? undefined
      : typeof transitionOptions === "object"
        ? transitionOptions
        : transitionOptions === true
          ? {}
          : { enabled: false };

  // Create the runtime once; the render callback derives its composition from
  // it, and it is established in context via ThemeProvider below.
  const runtime = createThemeRuntime({
    ...coreOptions,
    // Mirrors ThemeProvider: the runtime's `transition` drives scoped themes
    // and reads like the theme inspector.
    ...(resolvedTransition !== undefined
      ? { transition: resolvedTransition }
      : {}),
    dom: false,
    cssVariables: false,
  });

  // SSR-resolved selections (the `initial` option) are applied synchronously
  // here — better than the provider's passive effect, because the first
  // commit is already in flight.
  if (coreOptions.initial) {
    const { selection, theme } = coreOptions.initial;
    if (
      selection.mode !== "system" &&
      runtime.store.get().name !== theme.name
    ) {
      runtime.store.set(theme);
    }
    if (selection.family !== runtime.selection.getFamily()) {
      runtime.selection.setFamily(selection.family);
    }
    if (selection.mode !== runtime.selection.getMode()) {
      runtime.selection.setMode(selection.mode);
    }
  }

  // Flash-proofing parity with ThemeProvider: when persistence is enabled and
  // no bootstrap script exists yet, inject a blocking <script> that applies
  // the persisted selection before paint. Idempotent.
  if (
    typeof document !== "undefined" &&
    document.head &&
    coreOptions.persistence !== null &&
    coreOptions.themes?.length &&
    !document.getElementById("theme-kit-bootstrap")
  ) {
    const bootstrap = createThemeBootstrapScript({
      themes: coreOptions.themes,
      ...(coreOptions.defaultTheme !== undefined
        ? { defaultTheme: coreOptions.defaultTheme as string }
        : {}),
      ...(coreOptions.initialMode !== undefined
        ? { initialMode: coreOptions.initialMode }
        : {}),
      ...(coreOptions.initialFamily !== undefined
        ? { initialFamily: coreOptions.initialFamily }
        : {}),
    });
    if (bootstrap) {
      const script = document.createElement("script");
      script.id = "theme-kit-bootstrap";
      script.text = bootstrap;
      document.head.appendChild(script);
    }
  }

  const root = createRoot(container);

  const renderThemed = () =>
    root.render(
      <ThemeProvider {...providerOptions} runtime={runtime}>
        {render({ runtime })}
      </ThemeProvider>,
    );

  // Root-level synchronous initial commit. This runs in application/library
  // code that owns the root — never inside a component — which is the one
  // place React documents `flushSync` for this purpose.
  flushSync(() => {
    renderThemed();
  });

  return {
    root,
    runtime,
    unmount: () => {
      root.unmount();
      runtime.destroy();
    },
  };
}
