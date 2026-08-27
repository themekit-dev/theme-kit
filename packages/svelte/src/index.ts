import {
  createThemeRuntime,
  createCSSVariablesBinding,
  createDOMBinding,
  createOverlayScrollbar,
  resolveScopeTransition,
  createScopedThemeBinding,
  createThemeBootstrapScript,
  EMPTY_THEME_SCHEDULE_STATE,
  type OverlayScrollbarOptions,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
  type ThemeDefinition,
  type ThemeMode,
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
import { getContext, setContext, onMount } from "svelte";
import type { AdapterStrategy } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

export interface ThemeProviderProps<T extends ThemeDefinition = ThemeDefinition>
  extends ThemeRuntimeOptions<T> {
  runtime?: ThemeRuntime<T>;
  children?: import("svelte").Snippet;
}

const ThemeKitKey = Symbol("theme-kit");

type LegacySnippetRender = (anchor: Node, slotProps: Record<string, unknown>) => void;

function renderSnippet(
  children: import("svelte").Snippet | undefined,
  anchor: Node,
) {
  if (!children) return;
  (children as unknown as LegacySnippetRender)(anchor, {});
}

export function setThemeRuntime<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
) {
  setContext(ThemeKitKey, runtime);
}

export function getThemeRuntime<T extends ThemeDefinition>() {
  const runtime = getContext<ThemeRuntime<T>>(ThemeKitKey);
  if (!runtime) {
    throw new Error("getThemeRuntime must be used within a ThemeProvider");
  }
  return runtime;
}

function readableStore<T>(getter: () => T, subscribe: (cb: (v: T) => void) => () => void) {
  type Listener = (value: T) => void;
  const listeners = new Set<Listener>();

  let current = getter();

  const unsub = subscribe((val: T) => {
    current = val;
    for (const fn of listeners) {
      fn(current);
    }
  });

  return {
    subscribe(this: void, listener: Listener): () => void {
      listeners.add(listener);
      listener(current);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          unsub();
        }
      };
    },
    get value() {
      return current;
    },
  };
}

export function useThemeRuntime<T extends ThemeDefinition>() {
  return getThemeRuntime<T>();
}

export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = getThemeRuntime<T>();
  return readableStore(
    () => runtime.store.get(),
    (cb) => runtime.store.subscribe((t) => cb(t as T)),
  );
}

export function useThemeTokens<T extends ThemeDefinition>() {
  const runtime = getThemeRuntime<T>();
  return readableStore(
    () => runtime.store.get().tokens,
    (cb) => runtime.store.subscribe((t) => cb(t.tokens)),
  );
}

export function useThemeMode() {
  const runtime = getThemeRuntime();
  return readableStore(
    () => runtime.selection.getMode(),
    (cb) => runtime.store.subscribe(() => cb(runtime.selection.getMode())),
  );
}

export function useThemeFamily() {
  const runtime = getThemeRuntime();
  return readableStore(
    () => runtime.selection.getFamily(),
    (cb) => runtime.store.subscribe(() => cb(runtime.selection.getFamily())),
  );
}

export function useTheme<T extends ThemeDefinition>() {
  const runtime = getThemeRuntime<T>();

  const theme = readableStore(
    () => runtime.store.get(),
    (cb) => runtime.store.subscribe((t) => cb(t as T)),
  );

  const mode = readableStore(
    () => runtime.selection.getMode(),
    (cb) => {
      const unsub = runtime.store.subscribe(() => cb(runtime.selection.getMode()));
      return unsub;
    },
  );

  const family = readableStore(
    () => runtime.selection.getFamily(),
    (cb) => {
      const unsub = runtime.store.subscribe(() => cb(runtime.selection.getFamily()));
      return unsub;
    },
  );

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
  const runtime = getThemeRuntime<T>();

  const canUndo = readableStore(
    () => runtime.history.canUndo(),
    (cb) => runtime.store.subscribe(() => cb(runtime.history.canUndo())),
  );

  const canRedo = readableStore(
    () => runtime.history.canRedo(),
    (cb) => runtime.store.subscribe(() => cb(runtime.history.canRedo())),
  );

  const history = readableStore(
    () => runtime.history.getHistory(),
    (cb) => runtime.store.subscribe(() => cb(runtime.history.getHistory())),
  );

  function undo() {
    runtime.history.undo();
  }

  function redo() {
    runtime.history.redo();
  }

  function clear() {
    runtime.history.clear();
  }

  function jump(index: number) {
    runtime.history.jump(index);
  }

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    jump,
    history,
  };
}

export function useThemeBatch() {
  const runtime = getThemeRuntime();
  return (callback: () => void) => runtime.batch(callback);
}

export function useThemeSnapshot() {
  const runtime = getThemeRuntime();
  return () => runtime.snapshot();
}

export function useThemeRestore() {
  const runtime = getThemeRuntime();
  return (snapshot: ThemeRuntimeSnapshot) => runtime.restore(snapshot);
}

export function useThemeLifecycle() {
  const runtime = getThemeRuntime();
  return {
    on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
  };
}

export function useThemePacks() {
  const runtime = getThemeRuntime();
  return (pack: ThemePack<any>) => runtime.use(pack);
}

/**
 * Direct access to the runtime's sunrise/sunset scheduling controller.
 * Returns `null` when the provider was created without the `scheduled` option.
 *
 * ```svelte
 * const schedule = getThemeSchedule();
 * schedule?.enable();
 * schedule?.disable();
 * ```
 */
export function getThemeSchedule<T extends ThemeDefinition = ThemeDefinition>(): ThemeSchedule | null {
  return getThemeRuntime<T>().schedule ?? null;
}

/**
 * Reactive sunrise/sunset schedule state as a readable Svelte store. Returns
 * `null` when the provider has no `scheduled` option configured. The emitted
 * value tracks `enabled`, `active`, `status`, `sunrise`/`sunset` and the next
 * transition.
 *
 * ```svelte
 * const schedule = useThemeSchedule(); // `$schedule.enabled` …
 * ```
 */
export function useThemeSchedule<T extends ThemeDefinition = ThemeDefinition>() {
  const schedule = getThemeSchedule<T>();
  return schedule
    ? readableStore<ThemeScheduleState>(
        () => schedule.state,
        (cb) => schedule.subscribe((s) => cb(s)),
      )
    : null;
}

export interface UseAdapterOptions {
  strategy?: AdapterStrategy;
}

function installAdapter<T extends ThemeDefinition>(
  create: () => import("@theme-kit/core").ThemeAdapter<T>,
) {
  const runtime = getThemeRuntime<T>();
  const adapter = create();
  let handle: import("@theme-kit/core").AdapterRegistration | null = null;

  // Install synchronously (not inside `onMount`) so library adapters work even
  // when the parent is a legacy-mode Svelte component that never emits
  // `$.init()` and therefore never flushes `onMount`. `adapter.install` guards
  // on `document`, so this is SSR-safe.
  if (typeof window !== "undefined") {
    handle = runtime.adapters.use(adapter);
  }

  // Teardown via `onMount` so Svelte's effect tree disposes the adapter in
  // runes mode and in legacy mode (when the parent emits `$.init()`).
  onMount(() => () => {
    handle?.dispose();
    handle = null;
  });

  return adapter;
}

/**
 * Svelte composable that installs the shadcn/ui adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Call once in your app root:
 *
 * ```ts
 * import { useShadcnTheme } from "@theme-kit/svelte";
 *
 * useShadcnTheme();
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
 * Svelte composable that installs the Bootstrap adapter onto the active Theme
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
 * Svelte composable that installs the daisyUI adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
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
 * Svelte composable that installs the Open Props adapter onto the active Theme
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

function systemPrefersDark(): boolean {
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
  children: import("svelte").Snippet;
  /** Any additional attributes (e.g. `data-testid`) forwarded to the wrapper. */
  [key: string]: unknown;
}

/**
 * Applies a scoped theme to its subtree without touching the provider's global
 * selection. Own CSS variables, `data-theme`, `data-mode` and `.dark` are kept
 * on a wrapper `div` (created client-side and cleaned up on unmount), so nested
 * scopes and the rest of the page stay completely independent.
 *
 * `theme`/`family`/`mode` are read at mount. Family-based and boundary scopes
 * keep following the provider's light/dark/system mode while mounted.
 */
function ThemeScopeFn(anchor: SvelteAnchor, scopeProps: ThemeScopeProps) {
  const anchorNode = asNode(anchor);
  const runtime = getThemeRuntime();
  const {
    theme,
    family,
    mode,
    themes: localThemes,
    transition,
    className,
    children,
    ...rest
  } = scopeProps ?? {};

  // The scope's base selection. `theme` wins over `family`/`mode`. When neither
  // is given, the scope mirrors the provider's selection inside its own
  // boundary (family captured at mount + live mode).
  const baseSelection: ScopedThemeSelection =
    theme !== undefined
      ? theme
      : family !== undefined
        ? mode !== undefined
          ? { family, mode }
          : { family }
        : { family: runtime.selection.getFamily() ?? "default" };

  const combinedThemes = [...(localThemes ?? []), ...runtime.themes];
  const scopeTransition = resolveScopeTransition(runtime.transition, transition);

  if (typeof document === "undefined") {
    // SSR: no wrapper/variables are rendered; the subtree still mounts so the
    // initial data-* attributes on the provider's `:root` apply client-side.
    renderSnippet(children, anchorNode);
    return;
  }

  const wrapper = document.createElement("div");
  if (className) wrapper.className = className;
  for (const [key, value] of Object.entries(rest)) {
    if (value == null) continue;
    if (key.startsWith("on") || key.startsWith("$$")) continue;
    if (key === "class") continue;
    wrapper.setAttribute(key, String(value));
  }
  (anchorNode as ChildNode).before(wrapper);

  // Render the snippet inside the wrapper. The text anchor keeps the children
  // relative to the wrapper, and Svelte removes those nodes on unmount.
  const textAnchor = wrapper.appendChild(document.createTextNode(""));
  renderSnippet(children, textAnchor);

  const binding = createScopedThemeBinding(
    combinedThemes as ThemeDefinition[],
    wrapper,
    withGlobalMode(baseSelection, runtime.selection.getMode()),
    {
      ...(localThemes !== undefined ? { localThemes } : {}),
      ...(scopeTransition !== undefined ? { transition: scopeTransition } : {}),
    },
  );

  let destroyed = false;
  const unsubscribeStore = runtime.store.subscribe(() => {
    if (destroyed) return;
    if (typeof baseSelection === "string") return;
    if ("name" in baseSelection || baseSelection.mode !== undefined) return;
    binding.update(withGlobalMode(baseSelection, runtime.selection.getMode()));
  });

  // Teardown via `onMount` (instead of `onDestroy`) so it runs through
  // Svelte's effect tree in runes mode and in legacy mode when the parent
  // emits `$.init()`. The scope itself is created synchronously above, so the
  // scoping works even in the legacy-no-`$.init()` edge case; only the
  // cleanup is skipped there.
  onMount(() => () => {
    destroyed = true;
    unsubscribeStore();
    binding.destroy();
    wrapper.remove();
  });
}

/** The scoped theming component. See {@link ThemeScopeProps}. */
export const ThemeScope = ThemeScopeFn as unknown as Component<ThemeScopeProps>;

export interface ThemeScrollbarProps extends OverlayScrollbarOptions {}

function pickOptions(props?: ThemeScrollbarProps): OverlayScrollbarOptions {
  const opts: OverlayScrollbarOptions = {};
  if (!props) return opts;
  if (props.autoHide !== undefined) opts.autoHide = props.autoHide;
  if (props.autoHideDelay !== undefined) opts.autoHideDelay = props.autoHideDelay;
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
  if (props.thumbColor !== undefined) opts.thumbColor = props.thumbColor;
  if (props.trackColor !== undefined) opts.trackColor = props.trackColor;
  if (props.activeThumbColor !== undefined)
    opts.activeThumbColor = props.activeThumbColor;
  if (props.thumbHoverColor !== undefined)
    opts.thumbHoverColor = props.thumbHoverColor;
  if (props.zIndex !== undefined) opts.zIndex = props.zIndex;
  if (props.duration !== undefined) opts.duration = props.duration;
  if (props.animationDuration !== undefined)
    opts.animationDuration = props.animationDuration;
  if (props.axes !== undefined) opts.axes = props.axes;
  if (props.include !== undefined) opts.include = props.include;
  if (props.exclude !== undefined) opts.exclude = props.exclude;
  if (props.touch !== undefined) opts.touch = props.touch;
  if (props.dir !== undefined) opts.dir = props.dir;
  return opts;
}

function ThemeScrollbarFn(
  anchor: SvelteAnchor,
  props?: ThemeScrollbarProps,
) {
  const runtime = getThemeRuntime();
  let handle: { destroy(): void } | null = null;

  // Side-effect-only overlay: like the React/Next.js versions, this component
  // renders nothing itself — it just creates the overlay engine and tears it
  // down on unmount.

  // Create synchronously (not inside `onMount`) so the overlay scrollbar works
  // even when the parent is a legacy-mode component that never emits
  // `$.init()`. The manager self-heals via MutationObserver + periodic scans,
  // so running before children are fully painted is fine.
  if (typeof window !== "undefined") {
    handle = createOverlayScrollbar(runtime.store as any, pickOptions(props));
  }

  // Teardown via `onMount` so Svelte's effect tree destroys the overlay in
  // runes mode and in legacy mode (when the parent emits `$.init()`).
  onMount(() => () => {
    handle?.destroy();
    handle = null;
  });
}

/** The overlay scrollbar component. See {@link ThemeScrollbarProps}. */
export const ThemeScrollbar = ThemeScrollbarFn as unknown as Component<
  ThemeScrollbarProps
>;

/**
 * Svelte 5 mounts function components with `(internals, props)`. The type is
 * `ComponentInternals` (a branded type), but the runtime actually receives the
 * anchor `Node`. We keep the branded type on the signature so the exported
 * component is assignable to Svelte's `Component` interface (svelte-check), and
 * cast back to `Node` internally where it is used as the mount anchor.
 */
type SvelteAnchor = import("svelte").ComponentInternals;

function asNode(anchor: SvelteAnchor): Node {
  return anchor as unknown as Node;
}

import type { Component } from "svelte";

function ThemeProviderImpl<T extends ThemeDefinition = ThemeDefinition>(
  anchor: SvelteAnchor,
  props: ThemeProviderProps<T>,
) {
  const anchorNode = asNode(anchor);
  const { runtime, children, ...runtimeOptions } = props ?? {};
  const ownsRuntime = !runtime;
  let domBinding: { destroy(): void } | null = null;
  let cssBinding: { destroy(): void } | null = null;
  let runtimeInstance: ThemeRuntime<T> | undefined = runtime;

  if (ownsRuntime && !runtimeInstance) {
    const { dom, cssVariables, ...coreOptions } = runtimeOptions as any;
    runtimeInstance = createThemeRuntime({
      ...coreOptions,
      dom: false,
      cssVariables: false,
    } as any);
  }

  if (!runtimeInstance) {
    throw new Error("ThemeProvider: runtime not initialized");
  }

  setContext(ThemeKitKey, runtimeInstance);

  if (typeof document === "undefined") {
    renderSnippet(children, anchorNode);
    return;
  }

  renderSnippet(children, anchorNode);

  // IMPORTANT: The DOM/CSS bindings and the bootstrap script must be created
  // SYNCHRONOUSLY during component init, NOT inside `onMount`. Svelte 5 only
  // flushes legacy-mode `onMount` callbacks when the parent component is
  // compiled with `analysis.needs_context` (which emits `$.init()`). A plain
  // Svelte app that just renders `<ThemeProvider/>` without its own lifecycle
  // hooks never gets `$.init()` emitted, so `onMount` callbacks would be
  // silently dropped and the theme would never be applied to the DOM.
  if (typeof window !== "undefined") {
    const domOpts = runtimeOptions.dom;
    const cssOpts = runtimeOptions.cssVariables;

    // Flash-proofing: inject a blocking bootstrap script that reads the
    // persisted selection and applies the theme before first paint.
    if (
      ownsRuntime &&
      document.head &&
      runtimeOptions.persistence !== null &&
      runtimeOptions.themes?.length &&
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
        runtimeInstance!.store,
        domOpts !== undefined ? (domOpts as DOMBindingOptions) : undefined,
      );
    }

    if (cssOpts !== false) {
      cssBinding = createCSSVariablesBinding(
        runtimeInstance!.store,
        cssOpts !== undefined ? (cssOpts as CSSVariablesOptions) : undefined,
      );
    }
  }

  // Register teardown via `onMount` (not a returned destroy function — Svelte 5
  // does not invoke the return value of a plain function component). `onMount`
  // runs cleanup through Svelte's effect tree in runes mode, and in legacy mode
  // when the parent emits `$.init()`. In the legacy-no-`$.init()` edge case the
  // theme still applies (bindings are created synchronously above); only the
  // teardown is skipped there.
  onMount(() => () => {
    domBinding?.destroy();
    cssBinding?.destroy();
    if (ownsRuntime && runtimeInstance) {
      runtimeInstance.destroy();
    }
  });
}

/**
 * The Theme Kit provider component. Cast to Svelte's `Component` type so
 * `svelte-check` recognizes it as a component (Svelte 5 components have the
 * `(internals, props) => { $on?, $set? }` shape; the runtime only needs the
 * anchor, which is passed as the first argument).
 */
export const ThemeProvider = ThemeProviderImpl as unknown as Component<
  ThemeProviderProps<ThemeDefinition>
>;


// -- ThemeInspector action ---------------------------------------------------

import { ThemeKitInspector } from "@theme-kit/web";

/**
 * Build the blocking zero-flash `<head>` script for a Svelte app (SSR or SPA).
 *
 * Inlines core's `createThemeBootstrapScript` with the Svelte defaults
 * (`storageKey: "theme-selection"`, `prefix: "theme-"` — the same values the
 * Svelte `ThemeProvider` persistence and CSS variables use), so the persisted
 * theme is applied before first paint. Emit the returned string as a
 * blocking `<script>` inside `<head>` (e.g. a `<svelte:head>` slot).
 */
export function createSvelteThemeBootstrapScript<T extends ThemeDefinition>(
  options: ThemeBootstrapScriptOptions<T>,
): string {
  return createThemeBootstrapScript(options);
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
}

/**
 * Svelte action that mounts a `<theme-kit-inspector>` custom element into the
 * target node. Use in any `.svelte` file:
 *
 * ```svelte
 * <div use:themeInspector={{ bottom: 80, right: 24, size: 36, zIndex: 50 }} />
 * ```
 */
export function themeInspector(
  node: HTMLElement,
  props: ThemeInspectorProps = {},
) {
  ThemeKitInspector.define();
  const el = document.createElement("theme-kit-inspector");
  applyProps(el, props);
  node.appendChild(el);
  return {
    update(p: ThemeInspectorProps) {
      applyProps(el, p);
    },
    destroy() {
      el.remove();
    },
  };
}

function applyProps(el: HTMLElement, props: ThemeInspectorProps) {
  if (props.bottom != null) el.setAttribute("bottom", String(props.bottom));
  else el.removeAttribute("bottom");
  if (props.right != null) el.setAttribute("right", String(props.right));
  else el.removeAttribute("right");
  if (props.size != null) el.setAttribute("size", String(props.size));
  else el.removeAttribute("size");
  if (props.zIndex != null) el.setAttribute("z-index", String(props.zIndex));
  else el.removeAttribute("z-index");
}
