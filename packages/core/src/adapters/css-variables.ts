import { themeToCSSVariables } from "../css";
import type { ThemeStore } from "../types";
import type { ThemeDefinition } from "../model";
import { DEFAULT_THEME_TRANSITION, type ThemeTransitionOptions } from "../transition";
import {
  registerThemeProperties,
} from "./dom/transition";
import { createDOMWriteBatch } from "./dom/batch";
import {
  cancelThemeAnimation,
  createThemeDiff,
  createTransitionPlan,
  runThemeAnimation,
} from "../animation";

export interface CSSVariablesOptions {
  target?: HTMLElement;
  prefix?: string;
  transition?: ThemeTransitionOptions;
  styleSheet?: boolean;
  layerName?: string;
  /** Applied inside the single View Transition lightswitch right before the
   *  CSS variables are swapped, so the old snapshot shows the old attributes
   *  AND old colors together. Lets a co-binding (e.g. the DOM binding's
   *  `apply`) stay in sync with the crossfade instead of starting its own
   *  View Transition (which would skip/abort the first one). */
  onBeforeSwap?: (
    theme: ThemeDefinition,
    emitOptions?: { suppressTransition?: boolean },
  ) => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Create a binding that keeps CSS custom properties (`--theme-*`) on a
 *    target element (default `<html>`) in sync with the store. Applies the
 *    current theme immediately on creation and diffs updates.
 */
export function createCSSVariablesBinding(
  store: ThemeStore,
  options: CSSVariablesOptions = {},
) {
  const target =
    options.target ??
    (typeof document !== "undefined" ? document.documentElement : null);

  if (!target && !options.styleSheet) {
    return null;
  }

  const element = target;
  const prefix = options.prefix ?? "theme-";
  const useStyleSheet = options.styleSheet ?? false;
  const layerName = options.layerName ?? "theme-kit";

  let appliedVariables = new Map<string, string>();
  let styleElement: HTMLStyleElement | null = null;

  function applyTheme(theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }) {
    const variables = themeToCSSVariables(theme, { prefix });

    const suppressTransition = emitOptions?.suppressTransition ?? false;
    let cssNode: HTMLStyleElement | null = null;

    if (suppressTransition && typeof document !== "undefined" && document.head && !useStyleSheet) {
      cssNode = document.createElement("style");
      cssNode.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      );
      document.head.appendChild(cssNode);
    }

    if (useStyleSheet && typeof document !== "undefined") {
      applyStyleSheet(theme, variables, prefix, layerName);
      if (cssNode && document.head.contains(cssNode)) {
        document.head.removeChild(cssNode);
      }
      return;
    }

    // Own the whole visual-update pipeline: diff → plan → coordinate → swap →
    // cleanup. The planner returns null when nothing animatable changed, when
    // transitions are disabled, or when the user prefers reduced motion — in
    // all of those cases the variables are swapped immediately and no
    // transition styles are ever attached.
    const applyNow = () => {
      options.onBeforeSwap?.(theme, emitOptions);
      applyInlineVariables(element!, variables);
    };

    // Prefer a native cross-fade (View Transition API). It paints the NEW theme
    // beneath a snapshot of the OLD one and fades that snapshot out, so a
    // light→dark switch never passes through white intermediates (the colour
    // values interpolate, but the snapshot opacity owns the visible fade). This
    // is the fix for the "white shift" on cards during toggles.
    const transition = { ...DEFAULT_THEME_TRANSITION, ...options.transition };
    const supportsViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function";
    const useViewTransition =
      transition.enabled &&
      !prefersReducedMotion() &&
      transition.useViewTransition &&
      supportsViewTransition;

    if (suppressTransition) {
      applyNow();
    } else if (useViewTransition) {
      (document as any).startViewTransition(() => {
        applyNow();
        return Promise.resolve();
      });
    } else {
      const plan = createTransitionPlan(
        createThemeDiff(appliedVariables, variables),
        options.transition,
        { reducedMotion: prefersReducedMotion() },
      );

      if (plan) {
        runThemeAnimation({
          target: element!,
          plan,
          swap: applyNow,
        });
      } else {
        applyNow();
      }
    }

    if (cssNode && typeof document !== "undefined" && document.head) {
      if (document.body) {
        void document.body.offsetHeight;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.head.removeChild(cssNode!);
        });
      });
    }
  }

  function applyInlineVariables(element: HTMLElement, variables: Record<string, string>) {
    const batch = createDOMWriteBatch();

    for (const [variable, value] of Object.entries(variables)) {
      const previous = appliedVariables.get(variable);
      if (previous === value) continue;
      batch.setStyle(variable, value);
    }

    for (const variable of appliedVariables.keys()) {
      if (!(variable in variables)) {
        batch.setStyle(variable, null);
      }
    }

    batch.flush(element);

    appliedVariables = new Map(Object.entries(variables));
  }

  function applyStyleSheet(
    theme: ThemeDefinition,
    variables: Record<string, string>,
    cssPrefix: string,
    layer: string,
  ) {
    const id = `tk-vars-${layer}`;
    let el = document.getElementById(id) as HTMLStyleElement | null;

    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }

    const cssVars = Object.entries(variables)
      .filter(([key]) => {
        const prev = appliedVariables.get(key);
        return prev === undefined || prev !== variables[key];
      })
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    const removedVars = [...appliedVariables.keys()]
      .filter((key) => !(key in variables))
      .map((key) => `  ${key}: initial;`)
      .join("\n");

    const block = [cssVars, removedVars].filter(Boolean).join("\n");

    if (block) {
      el.textContent = `@layer ${layer} {\n  :root {\n${block}\n  }\n}`;
    }

    appliedVariables = new Map(Object.entries(variables));
  }

  applyTheme(store.get());

  // Register @property for all color variables ONCE at initialization
  if (element) {
    const initialVariables = themeToCSSVariables(store.get(), { prefix });
    registerThemeProperties(element, initialVariables, prefix);
  }

  // Apply the current theme immediately — otherwise `--theme-*` variables are
  // unset until the first store *change*, so the initial background/content
  // uses the default instead of the defined theme (and html/body background
  // rules flicker on first paint).
  applyTheme(store.get(), { suppressTransition: true });

  const unsubscribe = store.subscribe(applyTheme);

  return {
    destroy() {
      unsubscribe();
      if (element) cancelThemeAnimation(element);
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
        styleElement = null;
      }
      appliedVariables.clear();
    },
  };
}
