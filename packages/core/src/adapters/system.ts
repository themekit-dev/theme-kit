import type { ThemeDefinition } from "../model";
import type { ThemeStore } from "../types";

/**
 * Options for {@link createSystemThemeBinding}.
 *
 * The binding follows the OS color-scheme preference live and applies the
 * matching theme to the store. It requires a `Window` with a working
 * `matchMedia`; when none is available the binding is not created.
 */
export interface SystemThemeBindingOptions<T extends ThemeDefinition> {
  /** Theme applied when the media query matches (the OS prefers dark). */
  lightTheme: T;
  /** Theme applied when the media query does not match (the OS prefers light). */
  darkTheme: T;
  /** Media query used to detect the OS preference.
   *  @defaultValue `"(prefers-color-scheme: dark)"` */
  mediaQuery?: string;
  /** The `Window` to observe. Defaults to the global `window` when present.
   *  @defaultValue `window` (when defined) */
  view?: Window;
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

/**
 * Create a binding that applies the theme for "system" mode, following
 *    `prefers-color-scheme` live.
 *
 * @see {@link SystemThemeBindingOptions}
 */
export function createSystemThemeBinding<T extends ThemeDefinition>(
  store: ThemeStore<T>,
  options: SystemThemeBindingOptions<T>,
) {
  const view =
    options.view ?? (typeof window !== "undefined" ? window : undefined);

  if (!view || typeof view.matchMedia !== "function") {
    return null;
  }

  const media = view.matchMedia(
    options.mediaQuery ?? "(prefers-color-scheme: dark)",
  );

  const apply = (matches: boolean) => {
    store.set(matches ? options.darkTheme : options.lightTheme);
  };

  const listener = (event: MediaQueryListEvent) => {
    apply(event.matches);
  };

  apply(media.matches);

  const legacyMedia = media as LegacyMediaQueryList;

  if ("addEventListener" in media) {
    media.addEventListener("change", listener);
  } else {
    legacyMedia.addListener?.(listener);
  }

  return {
    destroy() {
      if ("removeEventListener" in media) {
        media.removeEventListener("change", listener);
      } else {
        legacyMedia.removeListener?.(listener);
      }
    },
  };
}
