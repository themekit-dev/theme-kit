"use client";

import { useSetThemeMode, useThemeMode } from "./hooks";

/**
 * A minimal demo-style button that cycles the theme mode:
 * `light → dark → system → light`.
 *
 * Renders a `<button>` whose label is the current mode. Use it for demos and
 * prototypes, or build your own control with {@link useTheme}.
 *
 * @example
 * ```tsx
 * <ThemeModeButton />
 * ```
 *
 * @see {@link useTheme}
 * @see {@link useThemeMode}
 */
export function ThemeModeButton() {
  const mode = useThemeMode();
  const setMode = useSetThemeMode();
  const nextMode =
    mode === "light" ? "dark" : mode === "dark" ? "system" : "light";

  return (
    <button type="button" onClick={() => setMode(nextMode)}>
      Mode: {mode}
    </button>
  );
}
