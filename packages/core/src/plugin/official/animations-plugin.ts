import type { ThemeDefinition } from "../../model/theme";
import type { ThemeTransitionOptions } from "../../transition";
import type { ThemePlugin } from "../types";
import { applyThemeTransition, removeThemeTransition } from "../../adapters/dom/transition";

export interface AnimationsPluginOptions {
  transition?: ThemeTransitionOptions;
  element?: HTMLElement;
}

export function createAnimationsPlugin<T extends ThemeDefinition>(
  options?: AnimationsPluginOptions,
): ThemePlugin<T> {
  const transition = options?.transition ?? {
    duration: 300,
    easing: "ease-in-out",
    property: "all",
    // Explicitly opt out of View Transitions — this plugin provides CSS
    // transition properties, not page-level crossfades.
    useViewTransition: false,
  };
  const element = options?.element ?? (typeof document !== "undefined" ? document.documentElement : null);

  return {
    name: "animations",
    version: "1.0.0",
    priority: 60,

    onBeforeThemeChange() {
      if (element) {
        applyThemeTransition(element, transition);
      }
    },

    onAfterThemeChange() {
    },

    onDestroy() {
      if (element) {
        removeThemeTransition(element);
      }
    },
  };
}
