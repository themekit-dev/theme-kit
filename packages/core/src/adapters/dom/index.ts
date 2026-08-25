import type { ThemeStore } from "../../types";
import type { ThemeDefinition } from "../../model";
import { applyDOMEffects } from "./effects";
import type { DOMBindingOptions } from "./types";

/**
 * Create a binding that syncs the store theme to the DOM: `data-theme`,
 *    `data-theme-mode`, `data-theme-family`, the `dark` class, and the
 *    `color-scheme` style — with transition support.
 */
export function createDOMBinding(
  store: ThemeStore,
  options: DOMBindingOptions = {},
) {
  const target =
    options.target ??
    (typeof document !== "undefined" ? document.documentElement : null);

  if (!target) {
    return null;
  }

  const attributeName = options.attributeName ?? "data-theme";
  // This binding only flips identity/attributes; it never starts a View
  // Transition itself. The CSS-variables binding owns the single
  // `startViewTransition` lightswitch and runs this `apply` inside it, so the
  // old snapshot is captured with the old attributes AND old colors together
  // (no white-shift) and nothing pipes a second View Transition on top.
  const subscribe = options.subscribe ?? true;

  const applyTheme = (theme: ThemeDefinition, emitOptions?: { suppressTransition?: boolean }) => {
    applyDOMEffects({
      target,
      attributeName,
      theme,
      ...(options.transition !== undefined
        ? {
            transition: {
              ...options.transition,
              // Transitions are enabled by default; only a transition
              // explicitly set to `false`, or an explicit suppression, turns
              // them off.
              enabled:
                (options.transition.enabled ?? true) &&
                !emitOptions?.suppressTransition,
            },
          }
        : {}),
    });
  };

  if (subscribe) {
    applyTheme(store.get());
    const unsubscribe = store.subscribe(applyTheme);
    return {
      apply: applyTheme,
      destroy() {
        unsubscribe();
      },
    };
  }

  return {
    apply: applyTheme,
    destroy() {},
  };
}

export type { DOMBindingOptions } from "./types";
