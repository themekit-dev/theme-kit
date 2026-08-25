import type { ThemeDefinition } from "../model";
import type { ThemeStore } from "../types";

export interface SystemThemeBindingOptions<T extends ThemeDefinition> {
  lightTheme: T;
  darkTheme: T;
  mediaQuery?: string;
  view?: Window;
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

/**
 * Create a binding that applies the theme for "system" mode, following
 *    `prefers-color-scheme` live.
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
