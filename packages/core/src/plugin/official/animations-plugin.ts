import type { ThemeDefinition } from "../../model/theme";
import type { ThemeTransitionOptions } from "../../transition";
import type { ThemePlugin } from "../types";
import { applyThemeTransition, removeThemeTransition } from "../../adapters/dom/transition";

/**
 * Options for {@link createAnimationsPlugin}.
 */
export interface AnimationsPluginOptions {
  /** CSS transition applied to the target element during theme changes. When
   *  omitted, a default transition of `300ms` `ease-in-out` over `all`
   *  properties is used, with View Transitions explicitly disabled. */
  transition?: ThemeTransitionOptions;
  /** Element to which the transition is applied. Defaults to
   *  `document.documentElement` in browser environments; `null` (no-op) in
   *  non-browser environments. */
  element?: HTMLElement;
}

/**
 * Creates a plugin that animates theme changes with CSS transitions.
 *
 * The plugin applies a CSS transition to the target element before a theme
 * change so the resulting token updates animate smoothly, and removes the
 * transition when the plugin is destroyed.
 *
 * @param options - Animation configuration.
 * @returns An `"animations"` theme plugin.
 *
 * @example
 * ```ts
 * const manager = createPluginManager();
 * manager.use(createAnimationsPlugin({ transition: { duration: 500 } }));
 * ```
 *
 * @remarks
 * The plugin opts out of View Transitions by default; it provides CSS
 * transition properties rather than page-level crossfades. `onDestroy` removes
 * the transition from the target element.
 *
 * @see {@link AnimationsPluginOptions}
 */
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
