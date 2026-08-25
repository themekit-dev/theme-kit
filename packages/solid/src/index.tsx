import {
  createThemeRuntime,
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
  createEffect,
  onMount,
  onCleanup,
  type JSX,
} from "solid-js";
import { insert } from "solid-js/web";
import type { AdapterStrategy } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

export interface ThemeProviderProps<
  T extends ThemeDefinition = ThemeDefinition,
> extends ThemeRuntimeOptions<T> {
  runtime?: ThemeRuntime<T>;
  children?: JSX.Element;
}

interface ThemeContextValue<T extends ThemeDefinition> {
  runtime: ThemeRuntime<T>;
}

const ThemeKitContext = createContext<ThemeContextValue<any> | null>(null);

export function useThemeRuntime<T extends ThemeDefinition>() {
  const ctx = useContext(ThemeKitContext) as ThemeContextValue<T> | undefined;
  if (!ctx) {
    throw new Error("useThemeRuntime must be used within a ThemeProvider");
  }
  return ctx.runtime;
}

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

export function useThemeBatch() {
  const runtime = useThemeRuntime();
  return (callback: () => void) => runtime.batch(callback);
}

export function useThemeSnapshot() {
  const runtime = useThemeRuntime();
  return () => runtime.snapshot();
}

export function useThemeRestore() {
  const runtime = useThemeRuntime();
  return (snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot);
}

export function useThemeLifecycle() {
  const runtime = useThemeRuntime();
  return {
    on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
  };
}

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

export interface UseAdapterOptions {
  strategy?: AdapterStrategy;
}

function installAdapter<T extends ThemeDefinition>(
  create: () => import("@theme-kit/core").ThemeAdapter<T>,
) {
  const runtime = useThemeRuntime<T>();
  const adapter = create();
  let handle: import("@theme-kit/core").AdapterRegistration | null = null;
  onMount(() => {
    handle = runtime.adapters.use(adapter);
  });
  onCleanup(() => {
    handle?.dispose();
    handle = null;
  });
  return adapter;
}

/**
 * Solid composable that installs the shadcn/ui adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Call once in your app root:
 *
 * ```tsx
 * import { useShadcnTheme } from "@theme-kit/solid";
 *
 * function App() {
 *   useShadcnTheme();
 *   return <YourApp />;
 * }
 * ```
 */
export function useShadcnTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapter<T>(() =>
    createShadcnAdapter(
      options.strategy ? { strategy: options.strategy } : {},
    ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Solid composable that installs the Bootstrap adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--bs-*` variables (including `-rgb` triplets), kept in sync as the active
 * theme changes.
 */
export function useBootstrapTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapter<T>(() =>
    createBootstrapAdapter(
      options.strategy ? { strategy: options.strategy } : {},
    ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Solid composable that installs the daisyUI adapter onto the active Theme Kit
 * runtime. Maintains a tagged `:root` style element with concrete
 * `--color-*` variables, kept in sync as the active theme changes.
 */
export function useDaisyTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapter<T>(() =>
    createDaisyAdapter(
      options.strategy ? { strategy: options.strategy } : {},
    ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Solid composable that installs the Open Props adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--brand`, `--link`, `--size-*` and related variables, kept in sync as the
 * active theme changes.
 */
export function useOpenPropsTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapter<T>(() =>
    createOpenPropsAdapter(
      options.strategy ? { strategy: options.strategy } : {},
    ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

export function ThemeProvider<T extends ThemeDefinition = ThemeDefinition>(
  props: ThemeProviderProps<T>,
) {
  const { runtime: extRuntime, children, ...runtimeOptions } = props;

  const ownsRuntime = !extRuntime;
  const [runtimeInstance] = createSignal<ThemeRuntime<T> | null>(
    extRuntime ?? null,
  );

  if (ownsRuntime && !runtimeInstance()) {
    const { dom, cssVariables, ...coreOptions } = runtimeOptions as any;
    const created = createThemeRuntime({
      ...coreOptions,
      dom: false,
      cssVariables: false,
    } as any) as ThemeRuntime<T>;
    (runtimeInstance as any)(() => created);
  }

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
          domOpts !== undefined ? (domOpts as DOMBindingOptions) : undefined,
        );
      }

      if (cssOpts !== false) {
        cssBinding = createCSSVariablesBinding(
          resolvedRuntime.store,
          cssOpts !== undefined ? (cssOpts as CSSVariablesOptions) : undefined,
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
    children,
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
  className?: string;
  children?: JSX.Element;
  /** Any additional attributes (e.g. `data-testid`) forwarded to the wrapper. */
  [key: string]: unknown;
}

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

export interface ThemeScrollbarProps extends OverlayScrollbarOptions {
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
  if (props.dir !== undefined) opts.dir = props.dir;
  return opts;
}

export function ThemeScrollbar(props: ThemeScrollbarProps) {
  const runtime = useThemeRuntime();

  onMount(() => {
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
  style?: string;
}

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
