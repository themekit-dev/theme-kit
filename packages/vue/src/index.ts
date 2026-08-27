import type { App, InjectionKey, Component } from "vue";
import {
  createThemeRuntime,
  createCSSVariablesBinding,
  createDOMBinding,
  createScopedThemeBinding,
  resolveScopedThemePrePaint,
  resolveScopeTransition,
  createOverlayScrollbar,
  createThemeBootstrapScript,
  EMPTY_THEME_SCHEDULE_STATE,
  type OverlayScrollbarOptions,
  type ThemeRuntime,
  type ThemeRuntimeOptions,
  type ThemeDefinition,
  type ThemeMode,
  type ScopedThemeSelection,
  type DOMBindingOptions,
  type CSSVariablesOptions,
  type ThemeLifecycleEventName,
  type ThemeTransitionOptions,
  type ThemeSchedule,
  type ThemeScheduleState,
  type ThemeScheduleSetOptions,
  type ThemeBootstrapScriptOptions,
} from "@theme-kit/core";
import {
  provide,
  inject,
  ref,
  watch,
  onMounted,
  onUnmounted,
  defineComponent,
  h,
  type PropType,
  type Ref,
} from "vue";
import type { AdapterStrategy } from "@theme-kit/core";
import { createShadcnAdapter } from "@theme-kit/shadcn/factory";
import { createBootstrapAdapter } from "@theme-kit/bootstrap/factory";
import { createDaisyAdapter } from "@theme-kit/daisyui/factory";
import { createOpenPropsAdapter } from "@theme-kit/open-props/factory";

export interface ThemeProviderProps<T extends ThemeDefinition = ThemeDefinition>
  extends ThemeRuntimeOptions<T> {
  runtime?: ThemeRuntime<T> | undefined;
}

export const ThemeKitSymbol: InjectionKey<ThemeRuntime<any>> =
  Symbol("theme-kit");

export function provideThemeRuntime<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
) {
  provide(ThemeKitSymbol, runtime);
}

export function useThemeRuntime<T extends ThemeDefinition>() {
  const runtime = inject(ThemeKitSymbol) as ThemeRuntime<T> | undefined;
  if (!runtime) {
    throw new Error("useThemeRuntime must be used within a ThemeProvider");
  }
  return runtime;
}

export function useThemeValue<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();
  const theme: Ref<T> = ref(runtime.store.get()) as Ref<T>;

  onMounted(() => {
    const unsub = runtime.store.subscribe((t) => {
      theme.value = t as T;
    });
    onUnmounted(unsub);
  });

  return theme;
}

export function useThemeTokens<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();
  const tokens: Ref<import("@theme-kit/core").ThemeTokens | undefined> = ref(runtime.store.get().tokens);

  onMounted(() => {
    const unsub = runtime.store.subscribe((t) => {
      tokens.value = t.tokens;
    });
    onUnmounted(unsub);
  });

  return tokens;
}

export function useThemeMode() {
  const runtime = useThemeRuntime();
  const mode: Ref<ThemeMode> = ref(runtime.selection.getMode());

  onMounted(() => {
    const unsubStore = runtime.store.subscribe(() => {
      mode.value = runtime.selection.getMode();
    });
    const unsubSelection = runtime.selection.subscribe
      ? runtime.selection.subscribe((s) => {
          mode.value = s.mode;
        })
      : () => {};
    onUnmounted(() => {
      unsubStore();
      unsubSelection();
    });
  });

  return mode;
}

export function useThemeFamily() {
  const runtime = useThemeRuntime();
  const family: Ref<string> = ref(runtime.selection.getFamily());

  onMounted(() => {
    const unsubStore = runtime.store.subscribe(() => {
      family.value = runtime.selection.getFamily();
    });
    const unsubSelection = runtime.selection.subscribe
      ? runtime.selection.subscribe((s) => {
          family.value = s.family;
        })
      : () => {};
    onUnmounted(() => {
      unsubStore();
      unsubSelection();
    });
  });

  return family;
}

export function useTheme<T extends ThemeDefinition>() {
  const runtime = useThemeRuntime<T>();

  const theme: Ref<T> = ref(runtime.store.get()) as Ref<T>;
  const mode: Ref<ThemeMode> = ref(runtime.selection.getMode());
  const family: Ref<string> = ref(runtime.selection.getFamily());

  let unsubTheme: (() => void) | null = null;
  let unsubSelection: (() => void) | null = null;

  onMounted(() => {
    unsubTheme = runtime.store.subscribe((t) => {
      theme.value = t as T;
    });
    if (runtime.selection.subscribe) {
      unsubSelection = runtime.selection.subscribe((s) => {
        mode.value = s.mode;
        family.value = s.family;
      });
    }
  });

  onUnmounted(() => {
    unsubTheme?.();
    unsubSelection?.();
  });

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

  const canUndo: Ref<boolean> = ref(runtime.history.canUndo());
  const canRedo: Ref<boolean> = ref(runtime.history.canRedo());
  const history = ref<readonly import("@theme-kit/core").HistoryEntry<T>[]>(runtime.history.getHistory());

  onMounted(() => {
    const unsub = runtime.store.subscribe(() => {
      canUndo.value = runtime.history.canUndo();
      canRedo.value = runtime.history.canRedo();
      history.value = runtime.history.getHistory();
    });
    onUnmounted(unsub);
  });

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
  const runtime = useThemeRuntime();
  return (callback: () => void) => runtime.batch(callback);
}

export function useThemeSnapshot() {
  const runtime = useThemeRuntime();
  return () => runtime.snapshot();
}

export function useThemeRestore() {
  const runtime = useThemeRuntime();
  return (snapshot: import("@theme-kit/core").ThemeRuntimeSnapshot) => runtime.restore(snapshot);
}

export function useThemeLifecycle() {
  const runtime = useThemeRuntime();
  return {
    on: (event: ThemeLifecycleEventName, listener: (data: unknown) => void) => runtime.lifecycle.on(event, listener),
  };
}

export function useThemePacks() {
  const runtime = useThemeRuntime();
  return (pack: import("@theme-kit/core").ThemePack<any>) => runtime.use(pack);
}

export interface ThemeScheduleController {
  /** The underlying controller (`null` when the provider has no `scheduled`
   *  option). Methods below are safe no-ops in that case. */
  schedule: ThemeSchedule | null;
  /** Reactive state snapshot: `enabled`, `active`, `status`, `sunrise`,
   *  `sunset`, `nextTransition`, `nextActivation`, `nextDeactivation`. */
  state: Ref<ThemeScheduleState>;
  enable: () => void;
  disable: () => void;
  set: (options: ThemeScheduleSetOptions) => void;
}

/**
 * Reactive access to the runtime's sunrise/sunset scheduling controller.
 *
 * Requires the runtime (or `<ThemeProvider>`) to be created with the
 * `scheduled` option. The returned `state` ref tracks `enabled`, `status`,
 * `active`, `sunrise`/`sunset` and the next transition; `enable()`/`disable()`
 * /`set()` control the engine.
 *
 * ```vue
 * <script setup lang="ts">
 * const schedule = useThemeSchedule();
 * </script>
 * ```
 */
export function useThemeSchedule<T extends ThemeDefinition = ThemeDefinition>(): ThemeScheduleController {
  const runtime = useThemeRuntime<T>();
  const schedule = runtime.schedule ?? null;

  // The schedule state is resolved per-visitor on the client (timezone
  // auto-detection and auto-derived themes), so it can differ between the
  // server render and the hydrated client. Hydrate with the stable empty
  // snapshot and let the subscription fill in the real state after mount —
  // this keeps SSR HTML deterministic and avoids a hydration mismatch.
  const state: Ref<ThemeScheduleState> = ref(EMPTY_THEME_SCHEDULE_STATE);

  onMounted(() => {
    if (!schedule) return;
    state.value = schedule.state;
    const unsub = schedule.subscribe((next) => {
      state.value = next;
    });
    onUnmounted(unsub);
  });

  return {
    schedule,
    state,
    enable: () => schedule?.enable(),
    disable: () => schedule?.disable(),
    set: (options: ThemeScheduleSetOptions) => schedule?.set(options),
  };
}

export interface UseAdapterOptions {
  strategy?: AdapterStrategy;
}

function installAdapterOnRuntime<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  create: () => import("@theme-kit/core").ThemeAdapter<T>,
) {
  const adapter = create();
  let handle: import("@theme-kit/core").AdapterRegistration | null = null;
  onMounted(() => {
    handle = runtime.adapters.use(adapter);
  });
  onUnmounted(() => {
    handle?.dispose();
    handle = null;
  });
  return adapter;
}

/**
 * Vue composable that installs the shadcn/ui adapter onto the active Theme Kit
 * runtime. Maintains a tagged `:root` style element with concrete `--*`
 * variables, kept in sync as the active theme changes.
 *
 * Call once in your app root:
 *
 * ```ts
 * import { useShadcnTheme } from "@theme-kit/vue";
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
  return installAdapterOnRuntime(
    useThemeRuntime<T>(),
    () =>
      createShadcnAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Vue composable that installs the Bootstrap adapter onto the active Theme Kit
 * runtime. Maintains a tagged `:root` style element with concrete `--bs-*`
 * variables (including `-rgb` triplets), kept in sync as the active theme
 * changes.
 */
export function useBootstrapTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapterOnRuntime(
    useThemeRuntime<T>(),
    () =>
      createBootstrapAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Vue composable that installs the daisyUI adapter onto the active Theme Kit
 * runtime. Maintains a tagged `:root` style element with concrete `--color-*`
 * variables, kept in sync as the active theme changes.
 */
export function useDaisyTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapterOnRuntime(
    useThemeRuntime<T>(),
    () =>
      createDaisyAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

/**
 * Vue composable that installs the Open Props adapter onto the active Theme
 * Kit runtime. Maintains a tagged `:root` style element with concrete
 * `--brand`, `--link`, `--size-*` and related variables, kept in sync as the
 * active theme changes.
 */
export function useOpenPropsTheme<T extends ThemeDefinition = ThemeDefinition>(
  options: UseAdapterOptions = {},
): import("@theme-kit/core").ThemeAdapter<T> {
  return installAdapterOnRuntime(
    useThemeRuntime<T>(),
    () =>
      createOpenPropsAdapter(
        options.strategy ? { strategy: options.strategy } : {},
      ) as import("@theme-kit/core").ThemeAdapter<T>,
  );
}

interface Props extends Record<string, any> {
  runtime?: ThemeRuntime<any> | undefined;
  themes?: ThemeDefinition[];
  defaultTheme?: string;
  initialMode?: ThemeMode;
  initialFamily?: string;
  persistence?: any;
  broadcast?: any;
  view?: Window;
  readPersistenceOnInit?: boolean;
  dom?: false | DOMBindingOptions;
  cssVariables?: false | CSSVariablesOptions;
  transition?: boolean | ThemeTransitionOptions;
  scheduled?: false | import("@theme-kit/core").ScheduledThemeOptions<ThemeDefinition>;
}

/**
 * Build the blocking zero-flash `<head>` script for a Vue app (SSR or SPA).
 *
 * Inlines core's `createThemeBootstrapScript` with the Vue defaults
 * (`storageKey: "theme-selection"`, `prefix: "theme-"` — the same values the
 * Vue `ThemeProvider` persistence and CSS variables use), so the persisted
 * theme is applied before first paint. Emit the returned string as a
 * blocking `<script>` inside `<head>`.
 */
export function createVueThemeBootstrapScript<T extends ThemeDefinition>(
  options: ThemeBootstrapScriptOptions<T>,
): string {
  return createThemeBootstrapScript(options);
}

const ThemeProvider = defineComponent({
  name: "ThemeProvider",
  inheritAttrs: false,
  props: {
    runtime: { type: Object, required: false, default: undefined },
    themes: { type: Array, required: false },
    defaultTheme: { type: String, required: false },
    initialMode: { type: String, required: false },
    initialFamily: { type: String, required: false },
    persistence: { type: Object, required: false },
    broadcast: { type: Object, required: false },
    view: { type: Object, required: false },
    // `default: undefined` (not Vue's implicit `false` for Boolean props) is
    // deliberate: an absent prop must stay `undefined` so `createThemeRuntime`
    // falls back to its own `readPersistenceOnInit ?? true` default and reads
    // the persisted selection on init. Without this, Vue coerces the absent
    // Boolean prop to `false`, silently disabling on-init persistence restore.
    readPersistenceOnInit: { type: Boolean, required: false, default: undefined },
    dom: { type: [Boolean, Object], required: false, default: undefined },
    cssVariables: { type: [Boolean, Object], required: false, default: undefined },
    transition: { type: [Boolean, Object], required: false, default: undefined },
    scheduled: { type: [Boolean, Object], required: false, default: undefined },
  },
  setup(props: Props, { slots }) {
    const ownsRuntime = !props.runtime;
    const runtimeRef = ref<ThemeRuntime<any> | null>(props.runtime ?? null);

    if (ownsRuntime && !runtimeRef.value) {
      const { runtime, dom, cssVariables, ...coreOptions } = props;
      runtimeRef.value = createThemeRuntime({
        ...coreOptions,
        dom: false,
        cssVariables: false,
      } as any);
    }

    const resolvedRuntime = runtimeRef.value! as any;

    provide(ThemeKitSymbol, resolvedRuntime);

    let domBinding: { apply(theme: any, emitOptions?: any): void; destroy(): void } | null = null;
    let cssBinding: { destroy(): void } | null = null;

    onMounted(() => {
      const domOpts = props.dom;
      const cssOpts = props.cssVariables;

      // Flash-proofing: inject a blocking bootstrap script that reads the
      // persisted selection and applies the theme before first paint.
      if (
        ownsRuntime &&
        typeof document !== "undefined" &&
        document.head &&
        props.persistence !== null &&
        props.themes?.length &&
        !document.getElementById("theme-kit-bootstrap")
      ) {
        const bootstrap = createThemeBootstrapScript({
          themes: props.themes as any,
          ...(props.defaultTheme !== undefined ? { defaultTheme: props.defaultTheme } : {}),
          ...(props.initialMode !== undefined ? { initialMode: props.initialMode } : {}),
          ...(props.initialFamily !== undefined ? { initialFamily: props.initialFamily } : {}),
        });
        if (bootstrap) {
          const script = document.createElement("script");
          script.id = "theme-kit-bootstrap";
          script.textContent = bootstrap;
          document.head.appendChild(script);
        }
      }

      // Resolve the transition config the same way the React provider does.
      const transitionOption = props.transition;
      const resolvedTransition =
        transitionOption === undefined
          ? undefined
          : typeof transitionOption === "object"
            ? transitionOption
            : transitionOption === true
              ? {}
              : { enabled: false };

      const cssBindingDrivesDom =
        cssOpts !== false &&
        (cssOpts === undefined || cssOpts.styleSheet !== true);

      if (domOpts !== false) {
        domBinding = createDOMBinding(resolvedRuntime.store, {
          ...(domOpts !== undefined ? (domOpts as DOMBindingOptions) : {}),
          // When the CSS binding is present and applying inline variables, it
          // drives the DOM updates inside its single View Transition lightswitch
          // via `onBeforeSwap`. Subscribing here too would fire a second,
          // competing `startViewTransition`. Otherwise the DOM binding owns its
          // updates.
          subscribe: !cssBindingDrivesDom,
          ...(resolvedTransition !== undefined
            ? { transition: resolvedTransition }
            : {}),
        });
      }

      if (cssOpts !== false) {
        cssBinding = createCSSVariablesBinding(resolvedRuntime.store, {
          ...(cssOpts !== undefined ? (cssOpts as CSSVariablesOptions) : {}),
          ...(resolvedTransition !== undefined
            ? { transition: resolvedTransition }
            : {}),
          ...(domBinding ? { onBeforeSwap: domBinding.apply } : {}),
        });
      }
    });

    onUnmounted(() => {
      domBinding?.destroy();
      cssBinding?.destroy();

      if (ownsRuntime && resolvedRuntime) {
        resolvedRuntime.destroy();
      }
    });

    return () => slots.default?.();
  },
}) as unknown as Component & { install(app: App): void };

ThemeProvider.install = (app: App) => {
  app.component("ThemeProvider", ThemeProvider);
};

export { ThemeProvider };

export interface ThemeScopeProps {
  /** Exact theme name or family name. When `family`/`mode` are also set,
   *  `theme` wins. Omit to follow the provider's selection inside a boundary. */
  theme?: string;
  /** Theme family for the scoped subtree. Without `mode`, follows the
   *  provider's current mode. */
  family?: string;
  /** Mode for a family-based scope. Defaults to the provider's current mode. */
  mode?: ThemeMode;
  /** Local theme definitions — resolved first, parent registry falls back.
   *  No second runtime is created. */
  themes?: readonly ThemeDefinition[];
  /** Transition for this scope. `undefined` inherits the provider's,
   *  `false` disables it, an object is merged over the provider config. */
  transition?: boolean | ThemeTransitionOptions;
}

let scopeIdCounter = 0;

export const ThemeScope = defineComponent({
  name: "ThemeScope",
  props: {
    theme: { type: String, required: false, default: undefined },
    family: { type: String, required: false, default: undefined },
    mode: { type: String as PropType<ThemeMode>, required: false, default: undefined },
    themes: { type: Array as PropType<readonly ThemeDefinition[]>, required: false, default: undefined },
    transition: {
      type: [Boolean, Object] as PropType<boolean | ThemeTransitionOptions>,
      default: undefined,
    },
  },
  slots: Object as any,
  setup(props, { slots }) {
    const runtime = useThemeRuntime();
    const elRef = ref<HTMLDivElement | null>(null);
    let binding: ReturnType<typeof createScopedThemeBinding> | null = null;
    const scopeId = `scope-${scopeIdCounter++}`;
    const prePaint = resolveScopedThemePrePaint(
      [...(props.themes ?? []), ...runtime.themes],
      toSelection(),
      { selector: `[data-v-tk-scope="${scopeId}"]` },
    );

    function effectiveMode(): ThemeMode {
      if (props.mode != null) return props.mode;
      return runtime.selection.getMode();
    }

    function toSelection(): ScopedThemeSelection {
      if (props.theme != null) return props.theme;
      if (props.family != null) {
        return { family: props.family, mode: effectiveMode() };
      }
      return { family: runtime.selection.getFamily() ?? "default", mode: runtime.selection.getMode() };
    }

    function createBinding() {
      const transition = resolveScopeTransition(runtime.transition, props.transition);
      binding = createScopedThemeBinding(runtime.themes, elRef.value!, toSelection(), {
        ...(props.themes != null ? { localThemes: props.themes } : {}),
        ...(transition != null ? { transition } : {}),
      });
    }

    // Create the binding once mounted so `elRef.value` is available — a watch
    // with `immediate: true` runs during setup, before the element exists, and
    // would never create the binding. Selection changes run through the
    // binding's diff → plan → animate pipeline (no rebuild), while
    // transition/local-theme config changes are swapped on the live binding.
    onMounted(() => {
      if (binding == null) createBinding();
    });

    watch(
      () => [props.theme, props.family, props.mode, props.transition, props.themes] as const,
      () => {
        if (!elRef.value) return;
        if (binding == null) {
          createBinding();
          return;
        }
        binding.setTransition(resolveScopeTransition(runtime.transition, props.transition));
        binding.setLocalThemes(props.themes);
        binding.update(toSelection());
      },
      { flush: "post" },
    );

    // Follow the provider's mode for family/boundary scopes.
    watch(
      () => runtime.selection.getMode(),
      () => {
        if (props.theme != null) return;
        binding?.update(toSelection());
      },
    );

    onUnmounted(() => {
      binding?.destroy();
    });

    return () =>
      h(
        "div",
        {
          ref: elRef,
          "data-v-tk-scope": scopeId,
          ...(prePaint.systemBased ? {} : { style: prePaint.lightVariables }),
        },
        [prePaint.css ? h("style", { innerHTML: prePaint.css }) : null, slots.default?.()],
      );
  },
}) as unknown as Component & { install(app: App): void };

ThemeScope.install = (app: App) => {
  app.component("ThemeScope", ThemeScope);
};

export interface ThemeScrollbarProps extends OverlayScrollbarOptions {
  tag?: string;
}

function pickDefined(prefs: ThemeScrollbarProps): OverlayScrollbarOptions {
  const opts: OverlayScrollbarOptions = {};
  if (prefs.autoHide !== undefined) opts.autoHide = prefs.autoHide;
  if (prefs.hoverExpand !== undefined) opts.hoverExpand = prefs.hoverExpand;
  if (prefs.draggable !== undefined) opts.draggable = prefs.draggable;
  if (prefs.clickToJump !== undefined) opts.clickToJump = prefs.clickToJump;
  if (prefs.smooth !== undefined) opts.smooth = prefs.smooth;
  if (prefs.overscroll !== undefined) opts.overscroll = prefs.overscroll;
  if (prefs.arrows !== undefined) opts.arrows = prefs.arrows;
  if (prefs.arrowIcon !== undefined) opts.arrowIcon = prefs.arrowIcon;
  if (prefs.arrowUpIcon !== undefined) opts.arrowUpIcon = prefs.arrowUpIcon;
  if (prefs.arrowDownIcon !== undefined) opts.arrowDownIcon = prefs.arrowDownIcon;
  if (prefs.arrowLeftIcon !== undefined) opts.arrowLeftIcon = prefs.arrowLeftIcon;
  if (prefs.arrowRightIcon !== undefined) opts.arrowRightIcon = prefs.arrowRightIcon;
  if (prefs.thickness !== undefined) opts.thickness = prefs.thickness;
  if (prefs.hoverThickness !== undefined)
    opts.hoverThickness = prefs.hoverThickness;
  if (prefs.radius !== undefined) opts.radius = prefs.radius;
  if (prefs.minThumbSize !== undefined) opts.minThumbSize = prefs.minThumbSize;
  if (prefs.offset !== undefined) opts.offset = prefs.offset;
  if (prefs.trackOpacity !== undefined) opts.trackOpacity = prefs.trackOpacity;
  if (prefs.thumbOpacity !== undefined) opts.thumbOpacity = prefs.thumbOpacity;
  if (prefs.duration !== undefined) opts.duration = prefs.duration;
  if (prefs.animationDuration !== undefined)
    opts.animationDuration = prefs.animationDuration;
  if (prefs.axes !== undefined) opts.axes = prefs.axes;
  if (prefs.touch !== undefined) opts.touch = prefs.touch;
  if (prefs.dir !== undefined) opts.dir = prefs.dir;
  return opts;
}

export const ThemeScrollbar = defineComponent({
  name: "ThemeScrollbar",
  props: {
    autoHide: { type: Boolean, required: false, default: undefined },
    hoverExpand: { type: Boolean, required: false, default: undefined },
    draggable: { type: Boolean, required: false, default: undefined },
    clickToJump: { type: Boolean, required: false, default: undefined },
    smooth: { type: Boolean, required: false, default: undefined },
    overscroll: { type: Boolean, required: false, default: undefined },
    arrows: { type: Boolean, required: false, default: undefined },
    arrowIcon: { type: String, required: false, default: undefined },
    arrowUpIcon: { type: String, required: false, default: undefined },
    arrowDownIcon: { type: String, required: false, default: undefined },
    arrowLeftIcon: { type: String, required: false, default: undefined },
    arrowRightIcon: { type: String, required: false, default: undefined },
    thickness: { type: Number, required: false, default: undefined },
    hoverThickness: { type: Number, required: false, default: undefined },
    radius: { type: Number, required: false, default: undefined },
    minThumbSize: { type: Number, required: false, default: undefined },
    offset: { type: Number, required: false, default: undefined },
    trackOpacity: { type: Number, required: false, default: undefined },
    thumbOpacity: { type: Number, required: false, default: undefined },
    duration: { type: Number, required: false, default: undefined },
    animationDuration: { type: Number, required: false, default: undefined },
    axes: { type: Array, required: false, default: undefined },
    touch: { type: Boolean, required: false, default: undefined },
    dir: {
      type: String,
      required: false,
      default: undefined,
      validator: (v: string) => v === "ltr" || v === "rtl" || v === "auto",
    },
  },
  setup(props: ThemeScrollbarProps) {
    const runtime = useThemeRuntime();
    let handle: { destroy(): void } | null = null;

    onMounted(() => {
      handle = createOverlayScrollbar(runtime.store as any, pickDefined(props));
    });

    onUnmounted(() => {
      handle?.destroy();
      handle = null;
    });

    return () => null;
  },
}) as unknown as Component & { install(app: App): void };

ThemeScrollbar.install = (app: App) => {
  app.component("ThemeScrollbar", ThemeScrollbar);
};

// ── ThemeInspector ──────────────────────────────────────────────────────────

import { ThemeKitInspector } from "@theme-kit/web";

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

export const ThemeInspector = defineComponent({
  name: "ThemeInspector",
  props: {
    bottom: { type: Number, required: false, default: undefined },
    right: { type: Number, required: false, default: undefined },
    size: { type: Number, required: false, default: undefined },
    zIndex: { type: Number, required: false, default: undefined },
  },
  setup(props) {
    onMounted(() => ThemeKitInspector.define());
    return () =>
      h("theme-kit-inspector", {
        ...(props.bottom != null ? { bottom: String(props.bottom) } : {}),
        ...(props.right != null ? { right: String(props.right) } : {}),
        ...(props.size != null ? { size: String(props.size) } : {}),
        ...(props.zIndex != null ? { "z-index": String(props.zIndex) } : {}),
      });
  },
}) as unknown as Component & { install(app: App): void };

ThemeInspector.install = (app: App) => {
  app.component("ThemeInspector", ThemeInspector);
};
