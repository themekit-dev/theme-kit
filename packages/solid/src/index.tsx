/**
 * Theme Kit Solid integration.
 *
 * Provides the `ThemeProvider`, `ThemeScope`, `ThemeScrollbar`, and
 * `ThemeInspector` components, the `useTheme*` hooks, and the SSR
 * bootstrap-script helper.
 *
 * @packageDocumentation
 */
import {
  createThemeRuntime,
  resolveRuntimeOptions,
  createCSSVariablesBinding,
  createDOMBinding,
  createOverlayScrollbar,
  resolveScopedTheme,
  resolveScopeTransition,
  themeToCSSVariables,
  createScopedThemeBinding,
  createThemeBootstrapScript,
  EMPTY_THEME_SCHEDULE_STATE,
  type OverlayScrollbarOptions,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeTokens,
  type DOMBindingOptions,
  type CSSVariablesOptions,
  type ThemeRuntimeSnapshot,
  type ThemePack,
  type ThemeLifecycleEventName,
  type ThemeTransitionOptions,
  type ScopedThemeSelection,
  type ThemeSchedule,
  type ThemeScheduleState,
  type ThemeScheduleSetOptions,
  type ThemeBootstrapScriptOptions,
} from "@theme-kit/core";
import {
  createComponent,
  createContext,
  useContext,
  createSignal,
  createMemo,
  createEffect,
  onMount,
  onCleanup,
  type JSX,
} from "solid-js";
import { insert } from "solid-js/web";

/**
 * Props accepted by {@link ThemeProvider}.
 *
 * Extends {@link ThemeRuntimeOptions} so the provider can build and own a
 * runtime from the same options used by `createThemeRuntime`. When `runtime`
 * is supplied the provider adopts that caller-owned runtime instead of
 * creating one.
 */
export interface ThemeProviderProps<
  T extends ThemeDefinition = ThemeDefinition,
> extends ThemeRuntimeOptions<T> {
  /** An existing runtime to adopt. When omitted the provider creates and owns
   *  its own runtime from the remaining props. */
  runtime?: ThemeRuntime<T>;
  /** The subtree rendered inside the provider's context. */
  children?: JSX.Element;
}

interface ThemeContextValue<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
}

const ThemeKitContext = createContext<ThemeContextValue<any> | null>(null);

/**
 * Returns the active {@link ThemeRuntime} from the nearest {@link ThemeProvider}.
 *
 * Must be called inside a component (owner) rendered within a `ThemeProvider`;
 * otherwise it throws. The returned runtime is the same object the provider
 * owns or adopts, so it is not reactive by itself — use the dedicated hooks
 * (`useThemeValue`, `useThemeMode`, …) for reactive reads.
 *
 * @returns The active theme runtime.
 *
 * @throws {Error} When called outside a `ThemeProvider`.
 *
 * @see {@link ThemeProvider}
 * @see {@link useThemeValue}
 */
export function useThemeRuntime<T extends ThemeDefinition>() {
  const ctx = useContext(ThemeKitContext) as ThemeContextValue<T> | undefined;
  if (!ctx) {
    throw new Error("useThemeRuntime must be used within a ThemeProvider");
  }
  return ctx.runtime;
}

/**
 * Reactive access to the current theme selection as a Solid signal.
 *
 * Returns a signal whose value tracks the runtime store's active theme. The
 * signal is seeded from the store on mount and updated on every store change;
 * the subscription is disposed automatically when the owning component is
 * cleaned up.
 *
 * @returns A Solid signal holding the active theme.
 *
 * @see {@link useTheme}
 * @see {@link useThemeRuntime}
 */
export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  const [theme, setTheme] = createSignal<T>(runtime.store.get() as T);

  onMount(() => {
    const unsub = runtime.store.subscribe((t) => {
      setTheme(() => t as T);
    });
    onCleanup(unsub);
  });

  return theme;
}

/**
 * Reactive access to the active theme's token group as a Solid signal.
 *
 * Returns a signal whose value is the `tokens` object of the current theme
 * selection, or `undefined` when the active theme defines no tokens. The
 * signal updates whenever the store's theme changes and the subscription is
 * disposed on component cleanup.
 *
 * @returns A Solid signal holding the active theme's tokens.
 *
 * @see {@link useThemeValue}
 */
export function useThemeTokens<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  const [tokens, setTokens] = createSignal<ThemeTokens | undefined>(
    runtime.store.get().tokens,
  );

  onMount(() => {
    const unsub = runtime.store.subscribe((t) => {
      setTokens(() => t.tokens);
    });
    onCleanup(unsub);
  });

  return tokens;
}

/**
 * Reactive access to the current theme mode as a Solid signal.
 *
 * Returns a signal tracking the runtime selection's mode (`light`, `dark`, or
 * `system`). The signal is seeded on mount and kept in sync with the store;
 * the subscription is disposed on component cleanup.
 *
 * @returns A Solid signal holding the current theme mode.
 *
 * @see {@link useTheme}
 */
export function useThemeMode() {
  const runtime = useThemeRuntime();

  const [mode, setModeState] = createSignal<ThemeMode>(
    runtime.selection.getMode(),
  );

  onMount(() => {
    const unsub = runtime.store.subscribe(() => {
      setModeState(() => runtime.selection.getMode());
    });
    onCleanup(unsub);
  });

  return mode;
}

/**
 * Reactive access to the current theme family as a Solid signal.
 *
 * Returns a signal tracking the runtime selection's theme family name. The
 * signal is seeded on mount and kept in sync with the store; the subscription
 * is disposed on component cleanup.
 *
 * @returns A Solid signal holding the current theme family name.
 *
 * @see {@link useTheme}
 */
export function useThemeFamily() {
  const runtime = useThemeRuntime();

  const [family, setFamilyState] = createSignal<string>(
    runtime.selection.getFamily(),
  );

  onMount(() => {
    const unsub = runtime.store.subscribe(() => {
      setFamilyState(() => runtime.selection.getFamily());
    });
    onCleanup(unsub);
  });

  return family;
}

/**
 * Reactive access to the current theme selection plus actions to change it.
 *
 * Combines the reactive signals from `useThemeValue`, `useThemeMode`, and
 * `useThemeFamily` with imperative setters that drive the runtime selection.
 * Must be called inside a component rendered within a `ThemeProvider`.
 *
 * @returns An object with reactive `theme`, `mode`, and `family` signals and
 *   the `setMode`, `setFamily`, and `toggleTheme` actions.
 *
 * @example
 * ```tsx
 * import { useTheme } from "@theme-kit/solid";
 *
 * function ThemeToggle() {
 *   const { mode, setMode, toggleTheme } = useTheme();
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current mode: {mode()}
 *     </button>
 *   );
 * }
 * ```
 *
 * @see {@link useThemeValue}
 * @see {@link useThemeMode}
 * @see {@link useThemeFamily}
 */
export function useTheme<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  const theme = useThemeValue<T>();
  const mode = useThemeMode();
  const family = useThemeFamily();

  function setMode(nextMode: ThemeMode) {
    runtime.selection.setMode(nextMode);
  }

  function setFamily(nextFamily: string) {
    runtime.selection.setFamily(nextFamily);
  }

  function toggleTheme() {
    runtime.selection.toggleTheme();
  }

  return {
    theme,
    mode,
    family,
    setMode,
    setFamily,
    toggleTheme,
  };
}

/**
 * Reactive access to the runtime's theme history (undo/redo).
 *
 * Returns reactive `canUndo`, `canRedo`, and `history` getters plus the
 * `undo`, `redo`, `clear`, and `jump` actions. The reactive state is seeded on
 * mount and refreshed whenever the store changes; the subscription is disposed
 * on component cleanup.
 *
 * @returns An object exposing the history state and navigation actions.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useThemeBatch}
 */
export function useThemeHistory<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  const [canUndo, setCanUndo] = createSignal(runtime.history.canUndo());
  const [canRedo, setCanRedo] = createSignal(runtime.history.canRedo());
  const [history, setHistory] = createSignal(runtime.history.getHistory());

  onMount(() => {
    const unsub = runtime.store.subscribe(() => {
      setCanUndo(() => runtime.history.canUndo());
      setCanRedo(() => runtime.history.canRedo());
      setHistory(() => runtime.history.getHistory());
    });
    onCleanup(unsub);
  });

  return {
    undo: () => runtime.history.undo(),
    redo: () => runtime.history.redo(),
    get canUndo() {
      return canUndo();
    },
    get canRedo() {
      return canRedo();
    },
    clear: () => runtime.history.clear(),
    jump: (index: number) => runtime.history.jump(index),
    get history() {
      return history();
    },
  };
}

/**
 * Returns a function that batches multiple runtime mutations into a single
 * store update.
 *
 * The returned callback forwards to the runtime's `batch` method, coalescing
 * several selection changes so subscribers observe one consolidated change.
 *
 * @returns A function accepting a callback whose mutations are batched.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
export function useThemeBatch() {
  const runtime = useThemeRuntime();
  return (callback: () => void) => runtime.batch(callback);
}

/**
 * Returns a function that captures the runtime's current state as a snapshot.
 *
 * The returned callback forwards to the runtime's `snapshot` method, producing
 * a {@link ThemeRuntimeSnapshot} that can later be passed to `useThemeRestore`.
 *
 * @returns A function returning the current runtime snapshot.
 *
 * @see {@link useThemeRestore}
 */
export function useThemeSnapshot() {
  const runtime = useThemeRuntime();
  return () => runtime.snapshot();
}

/**
 * Returns a function that restores the runtime from a previously captured
 * snapshot.
 *
 * The returned callback forwards to the runtime's `restore` method, applying
 * the given {@link ThemeRuntimeSnapshot} back onto the runtime.
 *
 * @returns A function accepting a snapshot to restore.
 *
 * @see {@link useThemeSnapshot}
 */
export function useThemeRestore() {
  const runtime = useThemeRuntime();
  return (snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot);
}

/**
 * Returns a function that subscribes to runtime lifecycle events.
 *
 * The returned `on` callback forwards to the runtime's lifecycle emitter,
 * registering a listener for the given {@link ThemeLifecycleEventName}.
 *
 * @returns An object exposing an `on` function to register lifecycle listeners.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
export function useThemeLifecycle() {
  const runtime = useThemeRuntime();
  return {
    on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
  };
}

/**
 * Returns a function that installs a theme pack onto the runtime.
 *
 * The returned callback forwards to the runtime's `use` method, registering a
 * {@link ThemePack} so its themes become available to the selection.
 *
 * @returns A function accepting a theme pack to install.
 *
 * @see {@link useThemeRuntime}
 * @see {@link useTheme}
 */
export function useThemePacks() {
  const runtime = useThemeRuntime();
  return (pack: ThemePack<any>) => runtime.use(pack);
}

/**
 * Reactive access to the runtime's sunrise/sunset scheduling controller.
 * Returns `null` when the provider was created without the `scheduled` option.
 * Reads of `enabled`/`active`/`status`/`sunrise`/`sunset`/`nextTransition`
 * track the underlying state reactively.
 *
 * ```tsx
 * const schedule = useThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * ```
 */
export function useThemeSchedule<T extends ThemeDefinition = ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();
  const controller = runtime.schedule ?? null;

  const [state, setState] = createSignal<ThemeScheduleState>(
    controller?.state ?? EMPTY_THEME_SCHEDULE_STATE,
  );

  onMount(() => {
    if (!controller) return;
    const unsub = controller.subscribe((next) => setState(() => next));
    onCleanup(unsub);
  });

  if (!controller) return null;

  return {
    enable: () => controller.enable(),
    disable: () => controller.disable(),
    set: (options: ThemeScheduleSetOptions) => controller.set(options),
    get enabled() {
      return state().enabled;
    },
    get active() {
      return state().active;
    },
    get status() {
      return state().status;
    },
    get sunrise() {
      return state().sunrise;
    },
    get sunset() {
      return state().sunset;
    },
    get nextTransition() {
      return state().nextTransition;
    },
    get nextActivation() {
      return state().nextActivation;
    },
    get nextDeactivation() {
      return state().nextDeactivation;
    },
    get lightTheme() {
      return state().lightTheme;
    },
    get darkTheme() {
      return state().darkTheme;
    },
  };
}

/**
 * Provides a {@link ThemeRuntime} to the Solid component tree via context.
 *
 * When no `runtime` prop is given the provider creates and owns a runtime from
 * the remaining {@link ThemeProviderProps} (which extend
 * {@link ThemeRuntimeOptions}), wiring up DOM and CSS-variable bindings on
 * mount and destroying the runtime on cleanup. When a `runtime` prop is
 * supplied the provider adopts that caller-owned runtime and does not destroy
 * it. Renders no DOM of its own — it only supplies context to its children.
 *
 * @param props The provider options and children.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from "@theme-kit/solid";
 *
 * function App() {
 *   return (
 *     <ThemeProvider defaultTheme="light">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @remarks
 * The provider must be mounted before any hook that reads the runtime
 * (`useTheme`, `useThemeRuntime`, …) is called, since those hooks throw when
 * no provider context exists. On the server the provider renders its children
 * without DOM bindings; the persisted selection is applied client-side before
 * first paint via an injected bootstrap script.
 *
 * @see {@link useTheme}
 * @see {@link ThemeScope}
 * @see {@link useThemeRuntime}
 */
export function ThemeProvider<T extends ThemeDefinition = ThemeDefinition>(
  props: ThemeProviderProps<T>,
) {
  // NOTE: we deliberately do NOT destructure `children` out of `props`. In JSX,
  // `children` is a getter that instantiates the child subtree the moment it is
  // read; reading it during setup (e.g. via rest destructuring or a spread)
  // would render the children BEFORE the ThemeKit context exists, making
  // `useTheme`/`useContext` fail with "must be used within a ThemeProvider".
  const extRuntime = props.runtime;
  const ownsRuntime = !extRuntime;

  // Build the runtime options by copying prop-by-prop, skipping `runtime` and
  // `children` so the children getter is never evaluated during setup. (A rest
  // destructure or object spread would read the `children` getter, which
  // instantiates the child subtree before the ThemeKit context exists.)
  const runtimeOptions = {} as Omit<ThemeProviderProps<T>, "runtime" | "children">;
  const propsRecord = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(props)) {
    if (key === "runtime" || key === "children") continue;
    (runtimeOptions as Record<string, unknown>)[key] = propsRecord[key];
  }

  const transitionOption = runtimeOptions.transition as boolean | ThemeTransitionOptions | undefined;
  const resolvedTransition =
    transitionOption === undefined
      ? undefined
      : typeof transitionOption === "object"
        ? transitionOption
        : transitionOption === true
          ? {}
          : { enabled: false };

  // `createMemo` (not `createSignal`): the runtime must be created synchronously
  // and be available on the very first render pass, because children read it via
  // `useContext` during that same render. A signal setter only takes effect after
  // the current computation completes, which would render children with a `null`
  // runtime (throwing "useThemeRuntime must be used within a ThemeProvider").
  const runtimeInstance = createMemo<ThemeRuntime<T> | null>(() => {
    if (!ownsRuntime) return extRuntime ?? null;

    const { dom, cssVariables, transition, ...coreOptions } = runtimeOptions as any;
    // Merges the configuration a build integration transported under these
    // props, so a provider with no `themes` still has a registry. Undefined
    // props are dropped by the helper, so an absent prop cannot clobber a
    // transported value.
    return createThemeRuntime({
      ...resolveRuntimeOptions(coreOptions),
      dom: false,
      cssVariables: false,
      // The runtime's `transition` drives scoped themes and reads like the
      // theme inspector; without it `runtime.transition` stays undefined even
      // though the provider was given a transition config.
      ...(resolvedTransition !== undefined
        ? { transition: resolvedTransition }
        : {}),
    } as any) as ThemeRuntime<T>;
  });

  const resolvedRuntime = runtimeInstance()!;

  let domBinding: { destroy(): void } | null = null;
  let cssBinding: { destroy(): void } | null = null;

  onMount(() => {
    if (typeof window !== "undefined") {
      const domOpts = runtimeOptions.dom as false | DOMBindingOptions | undefined;
      const cssOpts = runtimeOptions.cssVariables as false | CSSVariablesOptions | undefined;

      // Flash-proofing: inject a blocking bootstrap script that reads the
      // persisted selection and applies the theme before first paint.
      if (
        ownsRuntime &&
        document.head &&
        runtimeOptions.persistence !== null &&
        (runtimeOptions.themes as readonly ThemeDefinition[] | undefined)?.length &&
        !document.getElementById("theme-kit-bootstrap")
      ) {
        const bootstrap = createThemeBootstrapScript({
          themes: runtimeOptions.themes as any,
          ...(runtimeOptions.defaultTheme !== undefined ? { defaultTheme: runtimeOptions.defaultTheme as string } : {}),
          ...(runtimeOptions.initialMode !== undefined ? { initialMode: runtimeOptions.initialMode } : {}),
          ...(runtimeOptions.initialFamily !== undefined ? { initialFamily: runtimeOptions.initialFamily } : {}),
        });
        if (bootstrap) {
          const script = document.createElement("script");
          script.id = "theme-kit-bootstrap";
          script.textContent = bootstrap;
          document.head.appendChild(script);
        }
      }

      if (domOpts !== false) {
        domBinding = createDOMBinding(
          resolvedRuntime.store,
          {
            ...(domOpts !== undefined ? (domOpts as DOMBindingOptions) : {}),
            ...(resolvedTransition !== undefined ? { transition: resolvedTransition } : {}),
          },
        );
      }

      if (cssOpts !== false) {
        cssBinding = createCSSVariablesBinding(
          resolvedRuntime.store,
          {
            ...(cssOpts !== undefined ? (cssOpts as CSSVariablesOptions) : {}),
            ...(resolvedTransition !== undefined ? { transition: resolvedTransition } : {}),
          },
        );
      }
    }
  });

  onCleanup(() => {
    domBinding?.destroy();
    cssBinding?.destroy();
    if (ownsRuntime && resolvedRuntime) {
      resolvedRuntime.destroy();
    }
  });

  return createComponent(ThemeKitContext.Provider, {
    value: { runtime: resolvedRuntime },
    // Lazy getter: the Provider (Solid's createProvider) resolves children
    // inside `children(() => props.children)` — i.e. AFTER the context value
    // is attached to the current owner — so reading it there is safe.
    get children() {
      return props.children;
    },
  });
}

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Inject the live global mode into a family-based selection so `family`
 *  scopes follow the provider's light/dark/system selection. */
function withGlobalMode(
  selection: ScopedThemeSelection,
  mode: ThemeMode,
): ScopedThemeSelection {
  if (typeof selection === "string") return selection;
  if ("name" in selection) return selection;
  return { ...selection, mode: selection.mode ?? mode };
}

/**
 * Props accepted by {@link ThemeScope}.
 *
 * Configures a nested theme boundary that overrides the global selection for
 * its subtree. `theme` wins over `family`/`mode`; when none are given the
 * scope mirrors the provider's selection inside its own boundary.
 */
export interface ThemeScopeProps {
  /** Exact theme name, family name, or a `{ family, mode }`-style object.
   *  When `family`/`mode` are also passed, `theme` wins (it's the explicit
   *  selection). Omit to follow the global selection inside a new boundary. */
  theme?: string;
  /** Theme family for the scoped subtree. When `mode` is omitted the scope
   *  follows the provider's current mode (light/dark/system). */
  family?: string;
  /** Mode for a family-based scope. Optional — defaults to the provider's
   *  current mode so `family="plum"` flips light/dark with the page. */
  mode?: ThemeMode;
  /** Local theme definitions for genuinely isolated components. Resolved FIRST
   *  (they shadow same-named parent themes), then the provider's registry
   *  falls back — no second runtime is created. */
  themes?: readonly ThemeDefinition[];
  /** Transition for this scope's own theme changes. `undefined` inherits the
   *  `<ThemeProvider/>` transition, `false` disables it, `true` inherits, and
   *  an object is merged over the provider's config (local keys win). */
  transition?: boolean | ThemeTransitionOptions;
  /** CSS class applied to the scope's wrapper `<div>`. */
  className?: string;
  /** The subtree rendered inside the scope's wrapper. */
  children?: JSX.Element;
  /** Any additional attributes (e.g. `data-testid`) forwarded to the wrapper. */
  [key: string]: unknown;
}

/**
 * Creates a nested theme boundary that overrides the selection for its subtree.
 *
 * Renders a wrapper `<div>` carrying the resolved theme's `data-theme`,
 * `data-mode`, and CSS-variable inline styles, and keeps it in sync as the
 * scope's props or the provider's selection change. On the server no wrapper
 * is rendered — the children are returned directly so the provider's `:root`
 * attributes apply client-side.
 *
 * @param props The scope configuration and children.
 *
 * @remarks
 * The scope does not create a second runtime; it resolves against the
 * provider's theme registry, with any `themes` prop shadowing same-named
 * parent themes. Family-based and boundary-only scopes follow the provider's
 * live mode, flipping light/dark when the global mode changes.
 *
 * @see {@link ThemeProvider}
 * @see {@link useTheme}
 */
export function ThemeScope(props: ThemeScopeProps) {
  const runtime = useThemeRuntime();
  let ref: HTMLDivElement | null = null;
  let binding: ReturnType<typeof createScopedThemeBinding> | null = null;
  let unsubscribeStore: (() => void) | null = null;

  // The scope's base selection. `theme` wins over `family`/`mode`. When neither
  // is given, the scope mirrors the provider's selection inside its own
  // boundary (family captured at mount + live mode).
  const baseSelection = (): ScopedThemeSelection => {
    if (props.theme !== undefined) return props.theme as string;
    if (props.family !== undefined) {
      return props.mode !== undefined ? { family: props.family, mode: props.mode } : { family: props.family };
    }
    return { family: runtime.selection.getFamily() ?? "default" };
  };

  const combinedThemes = (): ThemeDefinition[] => [
    ...(props.themes ?? []),
    ...runtime.themes,
  ];
  const scopeTransition = () =>
    resolveScopeTransition(runtime.transition, props.transition);

  // Resolve the initial scope theme (family-aware, live mode) for SSR / first
  // paint inline styles.
  const initialResolved = resolveScopedTheme(
    combinedThemes(),
    withGlobalMode(baseSelection(), runtime.selection.getMode()),
    prefersDark(),
  );
  const initialStyle = {
    ...themeToCSSVariables(initialResolved, { prefix: "theme-" }),
  } as JSX.CSSProperties;
  const initialIsDark = initialResolved.meta?.mode === "dark";

  // SSR: no wrapper/variables are rendered; the subtree still mounts so the
  // initial data-* attributes on the provider's `:root` apply client-side.
  if (typeof document === "undefined") {
    return props.children;
  }

  const wrapper = document.createElement("div");
  ref = wrapper;

  if (props.className) wrapper.className = props.className;
  wrapper.setAttribute("data-theme", String(initialResolved.name));
  wrapper.setAttribute("data-mode", initialIsDark ? "dark" : "light");
  if (initialIsDark) wrapper.classList.add("dark");
  for (const key of Object.keys(props)) {
    if (
      key === "theme" ||
      key === "family" ||
      key === "mode" ||
      key === "themes" ||
      key === "transition" ||
      key === "className" ||
      key === "children"
    ) {
      continue;
    }
    const value = (props as any)[key];
    if (value == null) continue;
    if (typeof value === "function") continue;
    wrapper.setAttribute(key, String(value));
  }
  // Initial inline styles (kept stable; the binding owns them from here on).
  for (const [variable, value] of Object.entries(initialStyle)) {
    wrapper.style.setProperty(variable, value);
  }
  // Render children reactively inside the wrapper.
  insert(wrapper, () => props.children);

  onMount(() => {
    binding = createScopedThemeBinding(
      combinedThemes(),
      wrapper,
      withGlobalMode(baseSelection(), runtime.selection.getMode()),
      {
        ...(props.themes !== undefined ? { localThemes: props.themes } : {}),
        ...(scopeTransition() !== undefined ? { transition: scopeTransition() } : {}),
      },
    );

    // Reactive selection changes: `theme`/`family`/`mode` props mutate over
    // time and must re-resolve + animate, no remount.
    createEffect(() => {
      if (!binding) return;
      binding.update(withGlobalMode(baseSelection(), runtime.selection.getMode()));
    });

    // Transition config changed — swap it on the existing binding.
    createEffect(() => {
      if (!binding) return;
      binding.setTransition(scopeTransition());
    });

    // Local theme definitions swapped at runtime (late-loaded packs).
    createEffect(() => {
      if (!binding) return;
      binding.setLocalThemes(props.themes);
    });

    // Follow the provider's mode: family-based scopes (and boundary-only
    // scopes) flip light/dark when the global mode changes.
    unsubscribeStore = runtime.store.subscribe(() => {
      if (!binding) return;
      const base = baseSelection();
      if (typeof base === "string") return;
      if ("name" in base || base.mode !== undefined) return;
      binding.update(withGlobalMode(base, runtime.selection.getMode()));
    });
  });

  onCleanup(() => {
    unsubscribeStore?.();
    unsubscribeStore = null;
    binding?.destroy();
    binding = null;
  });

  return wrapper;
}

/**
 * Props accepted by {@link ThemeScrollbar}.
 *
 * Extends {@link OverlayScrollbarOptions} so the scrollbar can be configured
 * with the same options used by `createOverlayScrollbar`.
 */
export interface ThemeScrollbarProps extends OverlayScrollbarOptions {
  /** The subtree the scrollbar is applied to. */
  children?: JSX.Element;
}

function pickOptions(props: ThemeScrollbarProps): OverlayScrollbarOptions {
  const opts: OverlayScrollbarOptions = {};
  if (props.autoHide !== undefined) opts.autoHide = props.autoHide;
  if (props.hoverExpand !== undefined) opts.hoverExpand = props.hoverExpand;
  if (props.draggable !== undefined) opts.draggable = props.draggable;
  if (props.clickToJump !== undefined) opts.clickToJump = props.clickToJump;
  if (props.smooth !== undefined) opts.smooth = props.smooth;
  if (props.overscroll !== undefined) opts.overscroll = props.overscroll;
  if (props.arrows !== undefined) opts.arrows = props.arrows;
  if (props.arrowIcon !== undefined) opts.arrowIcon = props.arrowIcon;
  if (props.arrowUpIcon !== undefined) opts.arrowUpIcon = props.arrowUpIcon;
  if (props.arrowDownIcon !== undefined) opts.arrowDownIcon = props.arrowDownIcon;
  if (props.arrowLeftIcon !== undefined) opts.arrowLeftIcon = props.arrowLeftIcon;
  if (props.arrowRightIcon !== undefined) opts.arrowRightIcon = props.arrowRightIcon;
  if (props.thickness !== undefined) opts.thickness = props.thickness;
  if (props.hoverThickness !== undefined)
    opts.hoverThickness = props.hoverThickness;
  if (props.radius !== undefined) opts.radius = props.radius;
  if (props.minThumbSize !== undefined) opts.minThumbSize = props.minThumbSize;
  if (props.offset !== undefined) opts.offset = props.offset;
  if (props.trackOpacity !== undefined) opts.trackOpacity = props.trackOpacity;
  if (props.thumbOpacity !== undefined) opts.thumbOpacity = props.thumbOpacity;
  if (props.duration !== undefined) opts.duration = props.duration;
  if (props.animationDuration !== undefined)
    opts.animationDuration = props.animationDuration;
  if (props.axes !== undefined) opts.axes = props.axes;
  if (props.touch !== undefined) opts.touch = props.touch;
  if (props.thumbColor !== undefined) opts.thumbColor = props.thumbColor;
  if (props.trackColor !== undefined) opts.trackColor = props.trackColor;
  if (props.activeThumbColor !== undefined)
    opts.activeThumbColor = props.activeThumbColor;
  if (props.thumbHoverColor !== undefined)
    opts.thumbHoverColor = props.thumbHoverColor;
  if (props.zIndex !== undefined) opts.zIndex = props.zIndex;
  if (props.dir !== undefined) opts.dir = props.dir;
  return opts;
}

/**
 * A stable key for a set of options.
 *
 * Icons may be JSX, so they are reduced to a token rather than walked — a
 * deeper traversal can meet a circular reference and the key only has to notice
 * that the icon changed.
 */
function optionsKeyOf(opts: OverlayScrollbarOptions): string {
  return JSON.stringify(opts, (_key, value) => {
    if (typeof value === "function") return "fn";
    if (value && typeof value === "object" && !Array.isArray(value)) return "obj";
    return value;
  });
}

/**
 * Applies an overlay scrollbar to the runtime's scrollable content.
 *
 * Installs an overlay scrollbar bound to the active theme's store on mount and
 * destroys it on cleanup. Renders no DOM of its own — it returns `null` and
 * only manages the scrollbar lifecycle for the surrounding content.
 *
 * @param props The scrollbar options and children.
 *
 * @see {@link ThemeProvider}
 */
export function ThemeScrollbar(props: ThemeScrollbarProps) {
  const runtime = useThemeRuntime();

  // `createEffect` rather than `onMount`: the engine resolves its options once,
  // when the overlay is created, so a changed prop only takes effect if the
  // overlay is rebuilt — otherwise it is ignored until the page is reloaded.
  createEffect(() => {
    optionsKeyOf(pickOptions(props)); // track every option
    const handle = createOverlayScrollbar(runtime.store, pickOptions(props));
    onCleanup(() => handle?.destroy());
  });

  return null;
}


// -- ThemeInspector ---------------------------------------------------------

import { ThemeKitInspector } from "@theme-kit/web";

/**
 * Build the blocking zero-flash `<head>` script for a SolidJS app (SSR or SPA).
 *
 * Inlines core's `createThemeBootstrapScript` with the Solid defaults
 * (`storageKey: "theme-selection"`, `prefix: "theme-"` — the same values the
 * Solid `ThemeProvider` persistence and CSS variables use), so the persisted
 * theme is applied before first paint. Emit the returned string as a
 * blocking `<script>` inside `<head>`.
 *
 * @see `createThemeBootstrapScript`
 */
export function createSolidThemeBootstrapScript<T extends ThemeDefinition>(
  options: ThemeBootstrapScriptOptions<T>,
): string {
  return createThemeBootstrapScript(options);
}

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "theme-kit-inspector": HTMLAttributes<HTMLElement> & {
        bottom?: string;
        right?: string;
        size?: string;
        "z-index"?: string;
      };
    }
  }
}

/**
 * Props accepted by {@link ThemeInspector}.
 *
 * Configures the floating theme inspector's position, size, and z-index, plus
 * optional `class` and `style` forwarded to the underlying
 * `<theme-kit-inspector>` element.
 */
export interface ThemeInspectorProps {
  /** Distance from the bottom of the viewport, in px. Default 104. */
  bottom?: number;
  /** Distance from the right edge of the viewport, in px. Default 32. */
  right?: number;
  /** Toggle button size, in px. Default 40. */
  size?: number;
  /** Z-index for the floating toggle and panel. Default 9999. */
  zIndex?: number;
  /** Forwarded to the underlying <theme-kit-inspector> element. */
  class?: string;
  /** Inline styles forwarded to the underlying <theme-kit-inspector> element. */
  style?: string;
}

/**
 * Renders the floating theme inspector for the active runtime.
 *
 * Defines and mounts the `<theme-kit-inspector>` custom element, forwarding the
 * given position, size, z-index, `class`, and `style` props. The inspector
 * reads the active theme from the runtime and lets users inspect and switch
 * themes at runtime.
 *
 * @param props The inspector configuration.
 *
 * @see {@link ThemeProvider}
 * @see {@link useTheme}
 */
export function ThemeInspector(props: ThemeInspectorProps) {
  ThemeKitInspector.define();
  return (
    <theme-kit-inspector
      {...(props.bottom != null ? { bottom: String(props.bottom) } : {})}
      {...(props.right != null ? { right: String(props.right) } : {})}
      {...(props.size != null ? { size: String(props.size) } : {})}
      {...(props.zIndex != null ? { "z-index": String(props.zIndex) } : {})}
      {...(props.class != null ? { class: props.class } : {})}
      {...(props.style != null ? { style: props.style } : {})}
    />
  );
}
